var captureLinks = (function() {
	
	var links;
	
	Array.prototype.indexOf= Array.prototype.indexOf || 
		 function(what, index){
		 index= index || 0;
		 var L= this.length;
		 while(index< L){
		  if(this[index]=== what) return index;
		  ++index;
		 }
		 return -1;
	};
	
	function init(){
		links = getBackGroundImages();
		links = links.concat(getUrlsByElement('link','href'));
		links = links.concat(getUrlsByElement('a','href'));
		links = links.concat(getUrlsByElement('img','src'));
		links = links.concat(getUrlsByElement('script','src'));
		links = links.concat(getUrlsByElement('input','src'));
		links = links.concat(getBaseURL());
		// add Main page url
		//var newURL = window.location.protocol + "//" + window.location.host + "/main-pages_xXxXx.html";
		//links.push(newURL);
		links.sort();
		removeDuplicateURLS();
		links = validateLink(links);
		chrome.extension.sendRequest({"link":links,"content":document.documentElement.outerHTML});
	}
	
	function validateLink(argLinks){
		var a= document.createElement('a');
		var pp ="";
		var pathname = "";
		var b = [];
		var j=0;
		for (var i = 0; i < argLinks.length;i++) {
			a.href= argLinks[i];
			pathname = a.pathname.trim();
			var filename= a.pathname.split('/').pop();	
			filename = filename.trim();
			console.log(">>>"+pathname + "\t"+filename);
			if(pathname.indexOf("/") != pathname.lastIndexOf("/") 
				&& filename.lastIndexOf(".") >-1 && filename.lastIndexOf(".") < filename.length){
				// valid
				pp = pp + argLinks[i]+"\n";
				b[j] = argLinks[i];
				j++;
			}else if(pathname.indexOf("/") == pathname.lastIndexOf("/") && filename.lastIndexOf(".") >-1 && filename.lastIndexOf(".") < filename.length){
				pp = pp + argLinks[i]+"\n";
				b[j] = argLinks[i];
				j++;
			}
			
			
			
		}
		
		return b;
	}
	
	function getUrlsByElement(elm,attr){
		var urllinks = [].slice.apply(document.getElementsByTagName(elm));
			urllinks = urllinks.map(function(element) {
			var href = element[attr];
			var hashIndex = href.indexOf('#');
			if (hashIndex >= 0) {
				href = href.substr(0, hashIndex);
			}
			return href;
		});
		return urllinks;
	}
	
	// Capture background-images
	function getBackGroundImages(){
		var url, B= [], A= document.getElementsByTagName('*');
		A = B.slice.call(A, 0, A.length);
		while(A.length){
		  url= deepCss(A.shift(),'background-image');
		  if(url) url=/url\(['"]?([^")]+)/.exec(url) || [];
		  url= url[1];
		  if(url && B.indexOf(url)== -1) B[B.length]= url;
		}
		return B;
	}
	
	function deepCss(who, css){
		 if(!who || !who.style) return '';
		 var sty= css.replace(/\-([a-z])/g, function(a, b){
		  return b.toUpperCase();
		 });
		 if(who.currentStyle){
		  return who.style[sty] || who.currentStyle[sty] || '';
		 }
		 var dv= document.defaultView || window;
		 return who.style[sty] || 
		 dv.getComputedStyle(who,"").getPropertyValue(css) || '';
	}
	
	
	function getBaseURL(){
		var newURL = window.location.protocol + "//" + window.location.host + "/main-pages_xXxXx.html";
		return [newURL];
	}
	
	function removeDuplicateURLS(){
		var kBadPrefix = 'javascript';
		for (var i = 0; i < links.length;) {
			  if (((i > 0) && (links[i] == links[i - 1])) ||
				  (links[i] == '') ||
				  (kBadPrefix == links[i].toLowerCase().substr(0, kBadPrefix.length))) {
				links.splice(i, 1);
			  } else {
				++i;
			  }
		}


	}

	return {"init":init};
	
})();
captureLinks.init();