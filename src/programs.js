
function Notepad(file_path){
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in $IframeWindow)
	var document_title = file_path ? file_name_from_path(file_path) : "Untitled";
	var win_title = document_title + " - Notepad";
	// TODO: focus existing window if file is currently open?

	var $win = new $IframeWindow({
		src: "programs/notepad/index.html" + (file_path ? ("?path=" + file_path) : ""),
		icon: "notepad",
		title: win_title
	});
	return new Task($win);
}
Notepad.acceptsFilePaths = true;

function Paint(){
	var $win = new $IframeWindow({
		src: "programs/jspaint/index.html",
		icon: "paint",
		// NOTE: in Windows 98, "untitled" is lowercase, but TODO: we should just make it consistent
		title: "untitled - Paint"
	});

	var contentWindow = $win.$iframe[0].contentWindow;

	var waitUntil = function(test, interval, callback){
		if(test()){
			callback();
		}else{
			setTimeout(waitUntil, interval, test, interval, callback);
		}
	};

	// it seems like I should be able to use onload here, but when it works (overrides the function),
	// it for some reason *breaks the scrollbar styling* in jspaint
	// I don't know what's going on there

	// contentWindow.addEventListener("load", function(){
	// $(contentWindow).on("load", function(){
	// $win.$iframe.load(function(){
	// $win.$iframe[0].addEventListener("load", function(){
	waitUntil(function(){
		return contentWindow.set_as_wallpaper_centered;
	}, 500, function(){
		// TODO: maybe save the wallpaper in localStorage
		// TODO: maybe use blob URL (if only to not take up so much space in the inspector)
		contentWindow.systemSetAsWallpaperCentered = function(canvas){
			$desktop.css({
				backgroundImage: "url(" + canvas.toDataURL() + ")",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
			});
		};
		contentWindow.systemSetAsWallpaperTiled = function(canvas){
			$desktop.css({
				backgroundImage: "url(" + canvas.toDataURL() + ")",
				backgroundRepeat: "repeat",
			});
		};
	});
	
	return new Task($win);
}

function Minesweeper(){
	var $win = new $IframeWindow({
		src: "programs/minesweeper/index.html",
		icon: "minesweeper",
		title: "Minesweeper",
		innerWidth: 280,
		innerHeight: 320
	});
	return new Task($win);
}

function SoundRecorder(file_path){
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in $IframeWindow)
	var document_title = file_path ? file_name_from_path(file_path) : "Sound";
	var win_title = document_title + " - Sound Recorder";
	// TODO: focus existing window if file is currently open?
	var $win = new $IframeWindow({
		src: "programs/sound-recorder/index.html" + (file_path ? ("?path=" + file_path) : ""),
		icon: "speaker",
		title: win_title,
		innerWidth: 252+10,
		innerHeight: 102
	});
	return new Task($win);
}
SoundRecorder.acceptsFilePaths = true;

function Explorer(file_path){
	// TODO: DRY the default file names and title code (use document.title of the page in the iframe, in $IframeWindow)
	var document_title = file_path ? file_name_from_path(file_path) : "Homepage";
	var win_title = document_title;
	// TODO: focus existing window if folder is currently open
	// TODO: display file path fancy like (C:) if it's at the root of a drive
	// also we should probably have drives
	// as a thing
	// \also
	var $win = new $IframeWindow({
		src: "programs/explorer/index.html" + (file_path ? ("?path=" + file_path) : ""),
		icon: "folder-open",
		title: win_title,
		innerWidth: 500,
		innerHeight: 500,
	});
	return new Task($win);
}
Explorer.acceptsFilePaths = true;

var winamp_bundle_loaded = false;
var load_winamp_bundle_if_not_loaded = function(callback){
	if(winamp_bundle_loaded){
		callback();
	}else{
		// $.getScript("winamp/lib/winamp.bundle.js", callback);
		$.getScript("programs/winamp/lib/winamp.bundle.min.js", callback);
	}
}
function openWinamp(){
	load_winamp_bundle_if_not_loaded(function(){
		const winamp = new winamp2js({
			initialTracks: [{
				metaData: {
					artist: "DJ Mike Llama",
					title: "Llama Whippin' Intro",
				},
				url: "programs/winamp/mp3/llama-2.91.mp3"
			}],
			initialSkin: {
				url: "programs/winamp/skins/base-2.91.wsz"
			},
			enableHotkeys: true // Enable hotkeys
		});
		
		var container = document.createElement("div");
		container.classList.add("winamp-container");
		document.body.appendChild(container);
		// Render after the skin has loaded.
		var renderPromise = winamp.renderWhenReady(container);

		// TODO: handle blurring (currently one of the winamp windows is always selected)
		// (but I don't really handle blurring for regular windows yet, so maybe I should do that first!)
		
		// TODO: refactor for less hackiness
		var $win_for_Task = $(container);
		$win_for_Task.title = function(title){
			if(title !== undefined){
				// this probably shouldn't ever happen
			}else{
				return "Winamp";
			}
		};
		$win_for_Task.icon_name = "winamp2";
		new Task($win_for_Task);
		// a close event would be nice ;)
		renderPromise.then(function(){
			var iid = setInterval(function(){
				if($win_for_Task.find("[role=application]").length === 0){
					clearInterval(iid);
					$win_for_Task.triggerHandler("close");
				}
			}, 50);
		});
		
		// Bring window to front, initially and when clicked
		// copied from $Window.js, with `left: 0, top: 0` added
		// (because it's a container rather than a window,
		// and needs the left top origin for positioning the window)
		$win_for_Task.css({
			position: "absolute",
			left: 0,
			top: 0,
			zIndex: $Window.Z_INDEX++
		});
		$win_for_Task.bringToFront = function(){
			$win_for_Task.css({
				zIndex: $Window.Z_INDEX++
			});
		};
		$win_for_Task.on("pointerdown", function(){
			$win_for_Task.bringToFront();
		});

	});
}

/*
function Links(){
	var $win = new $Window({
		icon: "internet-folder",
		title: "Links",
		innerWidth: 640,
		innerHeight: 480
	});
	return new Task($win);
}
*/

/*
function saveAsDialog(){
	var $win = new $Window();
	$win.title("Save As");
	return $win;
}
function openFileDialog(){
	var $win = new $Window();
	$win.title("Open");
	return $win;
}
*/

var file_extension_associations = {
	"": Notepad,
	txt: Notepad,
	md: Notepad,
	json: Notepad,
	js: Notepad,
	css: Notepad,
	html: Notepad,
	gitattributes: Notepad,
	gitignore: Notepad,
	png: Paint,
	jpg: Paint,
	jpeg: Paint,
	gif: Paint,
	webp: Paint,
	bmp: Paint,
	tif: Paint,
	tiff: Paint,
	wav: SoundRecorder,
	mp3: openWinamp,
};

// Note: global executeFile called by explorer
function executeFile(file_path){
	// execute file with default handler
	// like the START command in CMD.EXE
	// TODO: check if it's a folder, if so open windows computer exe explorer exedll win32
//exe
//.
	var file_extension = file_extension_from_path(file_path);
	var program = file_extension_associations[file_extension];
	if(program){
		if(!program.acceptsFilePaths){
			alert(program.name + " does not support opening files via the virtual filesystem yet");
			return;
		}
		program(file_path);
	}else{
		alert("No program is associated with "+file_extension+" files");
	}
}

// TODO: base all the desktop icons off of the filesystem
var add_icon_not_via_filesystem = function(options){
	options.icon = $Icon(options.icon, DESKTOP_ICON_SIZE);
	new $FolderViewIcon(options).appendTo($folder_view);
};
add_icon_not_via_filesystem({
	title: "My Computer",
	icon: "my-computer",
	open: function(){ window.open("https://copy.sh/v86/?profile=windows98"); }
});
add_icon_not_via_filesystem({
	title: "My Documents",
	icon: "my-documents-folder",
	open: function(){ window.open("https://docs.google.com/"); }
});
add_icon_not_via_filesystem({
	title: "Network Neighborhood",
	icon: "network",
	open: function(){ window.open("https://nextdoor.com/"); }
});
add_icon_not_via_filesystem({
	title: "Recycle Bin",
	icon: "recycle-bin",
	open: function(){ window.open("https://www.epa.gov/recycle/"); }
});
add_icon_not_via_filesystem({
	title: "My Pictures",
	icon: "folder",
	open: function(){ window.open("https://photos.google.com/"); }
});
add_icon_not_via_filesystem({
	title: "Internet Explorer",
	icon: "internet-explorer",
	open: function(){ window.open("http://modern.ie/"); }
});
add_icon_not_via_filesystem({
	title: "Paint",
	icon: "paint",
	open: Paint,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Minesweeper",
	icon: "minesweeper",
	open: Minesweeper,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Sound Recorder",
	icon: "speaker",
	open: SoundRecorder,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Notepad",
	icon: "notepad",
	open: Notepad,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "Winamp",
	icon: "winamp2",
	open: openWinamp,
	shortcut: true
});
add_icon_not_via_filesystem({
	title: "(C:)",
	icon: "folder",
	open: Explorer,
	shortcut: true,
});
// add_icon_not_via_filesystem({
// 	title: "Links",
// 	icon: "internet-folder",
// 	open: Links
// });

$folder_view.arrange_icons();
