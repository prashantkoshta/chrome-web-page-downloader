var allLinks = [];
var visibleLinks = [];
var pageContent = "";
var flagSetPageContent = false;

// Display all visible links.
function showLinks() {
  var linksTable = document.getElementById('links');
  while (linksTable.children.length > 1) {
    linksTable.removeChild(linksTable.children[linksTable.children.length - 1])
  }
  for (var i = 0; i < visibleLinks.length; ++i) {
    var row = document.createElement('tr');
    var col0 = document.createElement('td');
    var col1 = document.createElement('td');
    var checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.id = 'check' + i;
    col0.appendChild(checkbox);
    col1.innerText = visibleLinks[i];
    col1.style.whiteSpace = 'nowrap';
    col1.onclick = function() {
      checkbox.checked = !checkbox.checked;
    }
    row.appendChild(col0);
    row.appendChild(col1);
    linksTable.appendChild(row);
  }
}

// Toggle the checked state of all visible links.
function toggleAll() {
  var checked = document.getElementById('toggle_all').checked;
  for (var i = 0; i < visibleLinks.length; ++i) {
    document.getElementById('check' + i).checked = checked;
  }
}

// Download all visible checked links.
function downloadCheckedLinks() {
	var str = "";
	var jsFiles = [];
	var plainTxt = "";
	var deltaStr = "_xXxXx";
	var pathName = "";
	var mainFileName = "";
    for (var i = 0; i < visibleLinks.length; ++i) {
    if (document.getElementById('check' + i).checked) {
	  var a= document.createElement('a');
	  a.href= visibleLinks[i];
	  var filename= a.pathname.split('/').pop();	
	  var temp = visibleLinks[i];
	  var linksForWrite = temp;
	  if(filename.indexOf(".js")>-1){
		temp = "<a id='aa"+i+"' download = '"+filename+deltaStr+"_"+i+"' href= '"+visibleLinks[i]+"'> </a>"+visibleLinks[i]
		str = str + temp + "<br />";
		linksForWrite = visibleLinks[i].replace(filename,filename +deltaStr+"_"+i);
		jsFiles.push(i);
	 }else{
		//str = str + temp + "<br />";
		/*chrome.downloads.download({url: visibleLinks[i]},function(id) {
			chrome.downloads.acceptDanger(id);
		}); */
		temp = "<a id='aa"+i+"' download = '"+filename+deltaStr+"_"+i+"' href= '"+visibleLinks[i]+"'> </a>"+visibleLinks[i]
		str = str + temp + "<br />";
		linksForWrite = visibleLinks[i].replace(filename,filename +deltaStr+"_"+i);
		jsFiles.push(i);
	 }
		
	 plainTxt = plainTxt + linksForWrite + "\r";
		
	  
    }
  }
  
   document.getElementById("sec-filter").style.display = 'none';
   document.getElementById("sec-text").innerHTML  = str;
   document.getElementById("sec-text").style.display = 'block';
   for(var j=0;j<jsFiles.length;j++){
		document.getElementById("aa"+jsFiles[j]).click();
   }
   //console.log("#downloadCheckedLinks:",pageContent);
   pageFileContentDownload(pageContent);
   downloadLinkFile(plainTxt);
}


var downloadLinkFile = function(content) {
  var container = document.getElementById("downloaded-links");
  window.URL = window.webkitURL || window.URL;
  const MIME_TYPE = 'text/plain';
  var fileContent = content;
  var fileName = "pages-link_xXxXx.txt"
  var bb = new Blob([fileContent], {type: MIME_TYPE});
  var ax = document.createElement('a');
  ax.id= "ctshttplinkfiles";
  ax.download = fileName; // File name
  ax.href = window.URL.createObjectURL(bb);
  ax.textContent = '';
  ax.dataset.downloadurl = [MIME_TYPE, ax.download, ax.href].join(':');
  container.appendChild(ax);
  ax.click();
};


var pageFileContentDownload = function(fileData,argMainFileName){
		var container = document.getElementById("page-id");
		window.URL = window.webkitURL || window.URL;
		const MIME_TYPE = 'html/plain';
		var fileContent = fileData;
		var fileName = argMainFileName;
		var bb = new Blob([fileContent], {type: MIME_TYPE});
		var ax = document.createElement('a');
		ax.id= "pagectshttplinkfiles";
		ax.download = "main-pages_xXxXx.html"; // File name
		ax.href = window.URL.createObjectURL(bb);
		ax.textContent = 'main-pages_xXxXx.html';
		ax.dataset.downloadurl = [MIME_TYPE, ax.download, ax.href].join(':');
		container.appendChild(ax);
		ax.click();
}

// Re-filter allLinks into visibleLinks and reshow visibleLinks.
function filterLinks() {
  var filterValue = document.getElementById('filter').value;
  if (document.getElementById('regex').checked) {
    visibleLinks = allLinks.filter(function(link) {
      return link.match(filterValue);
    });
  } else {
    var terms = filterValue.split(' ');
    visibleLinks = allLinks.filter(function(link) {
      for (var termI = 0; termI < terms.length; ++termI) {
        var term = terms[termI];
        if (term.length != 0) {
          var expected = (term[0] != '-');
          if (!expected) {
            term = term.substr(1);
            if (term.length == 0) {
              continue;
            }
          }
          var found = (-1 !== link.indexOf(term));
          if (found != expected) {
            return false;
          }
        }
      }
      return true;
    });
  }
  showLinks();
}

// Add links to allLinks and visibleLinks, sort and show them.  send_links.js is
// injected into all frames of the active tab, so this listener may be called
// multiple times.
chrome.extension.onRequest.addListener(function(obj) {
  //console.log("#popup:addListener",obj);
  if(!flagSetPageContent){
    pageContent = obj.content;
    flagSetPageContent = true;
  }
  var links = obj.link;
  for (var index in links) {
    allLinks.push(links[index]);
  }
  allLinks.sort();
  visibleLinks = allLinks;
  showLinks();
  
});


// Set up event handlers and inject send_links.js into all frames in the active
// tab.
window.onload = function() {
  document.getElementById('filter').onkeyup = filterLinks;
  document.getElementById('regex').onchange = filterLinks;
  document.getElementById('toggle_all').onchange = toggleAll;
  document.getElementById('download0').onclick = downloadCheckedLinks;
  document.getElementById('download1').onclick = downloadCheckedLinks;

  chrome.windows.getCurrent(function (currentWindow) {
		chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
			  chrome.tabs.executeScript(activeTabs[0].id, {file: 'js/send_links.js', allFrames: true});
		});
  });
};