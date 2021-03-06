
var grid_size_x = 75;
var grid_size_y = 75;

// TODO: what's the "right" way to do this sort of thing? (file associations and icons)

// var file_type_icons_by_program = new Map;
// file_type_icons_by_program.set(Notepad, "notepad-file");
// file_type_icons_by_program.set(Paint, "");
// file_type_icons_by_program.set(SoundRecorder, "");

var file_extension_icons = {
	txt: "notepad-file",
	md: "notepad-file",
	json: "notepad-file",
	js: "notepad-file",
	css: "notepad-file",
	html: "notepad-file",
	gitattributes: "notepad-file",
	gitignore: "notepad-file",
	// TODO: get more icons; can extract from shell32.dll, moricons.dll, and other files from a VM
	// also get more file extensions; can file a mime types listing data dump
	png: "image-gif", // "image-png"? nope... (but should it be image-gif or image-wmf?)
	jpg: "image-jpeg",
	jpeg: "image-jpeg",
	gif: "image-gif",
	webp: "image-other",
	bmp: "paint-file",
	tif: "kodak-imaging-file",
	tiff: "kodak-imaging-file",
	// wmf: "image-wmf"? nope (https://en.wikipedia.org/wiki/Windows_Metafile)
	// emf: "image-wmf"? nope
	// wmz: "image-wmf"? nope
	// emz: "image-wmf"? nope
	wav: "sound",
	mp3: "sound", // TODO: show blue video icon, as it's a container format that can contain video
	ogg: "sound", // TODO: probably ditto
	wma: "sound",
	// "doc": "doc"?
	"exe": "task", // TODO: look inside exe for icons
};

function $FolderView(folder_path) {
	// TODO: ensure a trailing slash / use path.join where appropriate

	// TODO: different view options, etc.
	
	var $folder_view = $("<div class='folder-view'>");
	
	// TODO: sort (by name I guess)
	$folder_view.arrange_icons = function(){
		var x = 0;
		var y = 0;
		// $folder_view.find(".desktop-icon")
		// .toArray()
		// .sort(function(a, b){
		// 	return (
		// 		$(a).find(".title").text().toLowerCase() >
		// 		$(b).find(".title").text().toLowerCase()
		// 	);
		// })
		// .forEach(function(el){
		// 	$(el).css({
		$folder_view.find(".desktop-icon").each(function(){
			$(this).css({
				left: x,
				top: y,
			});
			y += grid_size_y;
			if(y + grid_size_y > innerHeight){
				x += grid_size_x;
				y = 0;
			}
		});
	};

	withFilesystem(function(){
		var fs = BrowserFS.BFSRequire('fs');
		fs.readdir(folder_path, function (error, contents) {
			if(error){
				alert("Failed to read contents of the directory "+folder_path);
				throw error;
			}
			
			for(var i = 0; i < contents.length; i++){
				var fname = contents[i];
				var path = folder_path + fname;
				var x = Math.random() * innerWidth;
				var y = Math.random() * innerHeight;
				// add_icon_for_bfs_file(path, x, y);
				add_icon_for_bfs_file(fname, x, y);
			}
			$folder_view.arrange_icons();
		});
	});

	// NOTE: in Windows, icons normally only get moved if they go offscreen (by maybe half the grid size)
	// we're essentially handling it as if Auto Arrange is on
	$(window).on("resize", $folder_view.arrange_icons);

	// Handle selecting icons
	(function(){
		var $marquee = $("<div class='marquee'/>").appendTo($folder_view).hide();
		var start = {x: 0, y: 0};
		var current = {x: 0, y: 0};
		var dragging = false;
		var drag_update = function(){
			var min_x = Math.min(start.x, current.x);
			var min_y = Math.min(start.y, current.y);
			var max_x = Math.max(start.x, current.x);
			var max_y = Math.max(start.y, current.y);
			$marquee.show().css({
				position: "absolute",
				left: min_x,
				top: min_y,
				width: max_x - min_x,
				height: max_y - min_y,
			});
			$folder_view.find(".desktop-icon").removeClass("selected").each(function(i, folder_view_icon){
				// TODO/FIXME: account for address bar
				// also this is considerably more complicated in Windows 98
				// like things are not considered the same heights (or positions?) based on the size of their names
				// var rect = folder_view_icon.getBoundingClientRect();
				var icon_offset = $(folder_view_icon).offset();
				// console.log(icon_offset.top, min_y, max_y);
				if(
					// rect.left < max_x &&
					// rect.top < max_y &&
					// rect.right > min_x &&
					// rect.bottom > min_y
					icon_offset.left < max_x &&
					icon_offset.top < max_y &&
					icon_offset.left + $(folder_view_icon).width() > min_x &&
					icon_offset.top + $(folder_view_icon).height() > min_y
				){
					$(folder_view_icon).addClass("selected");
				}
			});
		};
		$folder_view.on("pointerdown", ".desktop-icon", function(e){
			$folder_view.find(".desktop-icon").removeClass("selected focused");
			$(this).addClass("selected focused");
		});
		$folder_view.on("pointerdown", function(e){
			// TODO: allow a margin of mouse movement before starting selecting
			var view_was_focused = $folder_view.hasClass("focused");
			$folder_view.addClass("focused");
			var $icon = $(e.target).closest(".desktop-icon");
			$marquee.hide();
			var folder_view_offset = $folder_view.offset();
			start = {x: e.pageX - folder_view_offset.left, y: e.pageY - folder_view_offset.top};
			current = {x: e.pageX - folder_view_offset.left, y: e.pageY - folder_view_offset.top};
			if($icon.length > 0){
				$marquee.hide();
			}else{
				dragging = true;
				// don't deselect right away unless the desktop was focused
				if(view_was_focused){
					drag_update();
				}
			}
		});
		$(window).on("pointerdown", function(e){
			if($(e.target).closest(".folder-view").length == 0){
				$folder_view.removeClass("focused");
			}
		});
		$(window).on("pointermove", function(e){
			var folder_view_offset = $folder_view.offset();
			current = {x: e.pageX - folder_view_offset.left, y: e.pageY - folder_view_offset.top};
			// TODO: bind/clamp coordinates to within folder view
			// (The marquee border should always show up, against the edge of the screen,
			// it shouldn't overlap the address bar,
			// and it shouldn't cause a scrollbar)
			// TODO: handle scroll position
			if(dragging){
				drag_update();
			}
		});
		$(window).on("pointerup blur", function(){
			$marquee.hide();
			dragging = false;
		});
	})();

	// TODO: select icons with the keyboard

	$(window).on("keydown", function(e){
		if($folder_view.is(".focused")){
			if(e.key == "Enter"){
				$folder_view.find(".desktop-icon.selected").trigger("dblclick");
			}else if(e.ctrlKey && e.key == "a"){
				$folder_view.find(".desktop-icon").addClass("selected");
			}
		}
	});

	var get_icon_for_file_path = function (file_path){
		// fs should be guaranteed available at this point
		// as this function is currently used
		var fs = BrowserFS.BFSRequire('fs');
		return new Promise(function(resolve, reject){
			fs.stat(file_path, function(err, stats){
				if(err){
					return reject(err);
				}
				if(stats.isDirectory()){
					return resolve("folder");
				}
				var file_extension = file_extension_from_path(file_path);
				var icon_name = file_extension_icons[file_extension];
				resolve(icon_name || "file");
			});
		});
	};
	// var add_icon_for_bfs_file = function(file_path, x, y){
	var add_icon_for_bfs_file = function(file_name, x, y){
		var file_path = folder_path + file_name;
		return $FolderViewIcon({
			title: file_name,
			// icon: $IconByPathPromise(get_icon_for_file_path(file_path), DESKTOP_ICON_SIZE),
			icon: $IconByIDPromise(get_icon_for_file_path(file_path), DESKTOP_ICON_SIZE),
			open: function(){ executeFile(file_path); }
		}).appendTo($folder_view).css({
			left: x,
			top: y,
		});
	};
	var drop_file = function(file, x, y){

		var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
		var fs = BrowserFS.BFSRequire('fs');

		var file_path = folder_path + file.name;
		// TODO: investigate maximum callstack size exceeded when there's an accidental trailing slash
		// file_path = "sdfsdfsdf/sdf/";
		// I guess it's probably that it splits it and the last component is "" and "" = "."
		
		var reader = new FileReader;
		reader.onerror = function(error){
			throw error;
		};
		reader.onload = function(e){
			var buffer = Buffer.from(reader.result);
			fs.writeFile(file_path, buffer, {flag: "wx"}, function(error){
				if(error){
					if(error.code === "EEXIST"){
						// TODO: options to replace or keep both files with numbers like "file (1).txt"
						alert("File already exists!");
					}
					throw error;
				}
				// TODO: could do utimes as well with file.lastModified or file.lastModifiedDate
				
				add_icon_for_bfs_file(file.name, x, y);
			});
		};
		reader.readAsArrayBuffer(file);
	};

	var dragover_pageX = 0;
	var dragover_pageY = 0;
	$folder_view.on("dragover", function(e){
		e.preventDefault();
		dragover_pageX = e.originalEvent.pageX;
		dragover_pageY = e.originalEvent.pageY;
	});
	$folder_view.on("drop", function(e){
		e.preventDefault();
		var x = e.originalEvent.pageX || dragover_pageX;
		var y = e.originalEvent.pageY || e.dragover_pageY
		// TODO: handle dragging icons onto other icons
		withFilesystem(function(){
			var files = e.originalEvent.dataTransfer.files;
			$.map(files, function(file){
				// TODO: stagger positions, don't just put everything on top of each other
				// also center
				drop_file(file, x, y);
			});
		});
	});

	return $folder_view;
}
