var gCtx = null;
var gCanvas = null;
var c = 0;
var stype = 0;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;

var vidhtml = '<video id="v" autoplay></video>';

function initCanvas(w,h) {
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}

function contrastImage(imageData, contrast) {
    var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for(var i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i+1] = factor * (data[i+1] - 128) + 128;
        data[i+2] = factor * (data[i+2] - 128) + 128;
    }
    return imageData;
}

function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM) {
        try{
            gCtx.drawImage(v, 0, 0);
            // gCtx.putImageData(contrastImage(gCtx.getImageData(0, 0, 640, 480), 100), 0, 0);
            try{
                qrcode.decode();
            } catch(e) {
                setTimeout(captureToCanvas, 500);
            };
        } catch(e){
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(address) {
    $('#mainbody').remove();
    $('#qr-canvas').remove();
    $('#tracker-content').innerHTML = '<div style="margin: 10px;"> \
        <a href="https://testnet.etherscan.io/address/'+address+'>See transactions</a> \
        <h3>HANDLER: '+getHandler(address).name+'</h3> \
        </div>';
    // var html="<br>";
    // if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
    //     html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    // html+="<b>"+htmlEntities(a)+"</b><br><br>";
    // document.getElementById("result").innerHTML = html;
}

function isCanvasSupported() {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    console.log(stream);
    console.log("Success setting up webcam");
    if(webkit)
        v.src = window.URL.createObjectURL(stream);
    else if(moz) {
        v.mozSrcObject = stream;
        v.play();
    } else v.src = stream;
    gUM=true;
    setTimeout(captureToCanvas, 500);
}

function error(error) {
    console.log("Erorrs occurring while setting up webcam");
    gUM=false;
    return;
}

function load(){
	if(isCanvasSupported())	{
		initCanvas(800, 600);
		qrcode.callback = read;
		document.getElementById("mainbody").style.display="inline";
        setwebcam();
        console.log("Setting webcam");
	} else {
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}

function setwebcam() {
	var options = true;
	if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
		try {
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
			  devices.forEach(function(device) {
				if (device.kind === 'videoinput') {
				  if(device.label.toLowerCase().search("back") >-1)
					options={'deviceId': {'exact':device.deviceId}, 'facingMode':'environment'} ;
				}
				console.log(device.kind + ": " + device.label +" id = " + device.deviceId);
			  });
			  setwebcam2(options);
			});
		} catch(e) {
			console.log(e);
		}
	}
	else{
		console.log("no navigator.mediaDevices.enumerateDevices" );
		setwebcam2(options);
	}

}

function setwebcam2(options) {
	console.log(options);
	document.getElementById("result").innerHTML = "- scanning -";

    if(stype == 1) {
        setTimeout(captureToCanvas, 500);
        return;
    }
    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v = document.getElementById("v");

    if(n.getUserMedia) {
		webkit=true;
        n.getUserMedia({video: options, audio: false}, success, error);
	} else if(n.webkitGetUserMedia) {
        webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, success, error);
    } else if(n.mozGetUserMedia) {
        moz=true;
        n.mozGetUserMedia({video: options, audio: false}, success, error);
    }

    stype=1;
    setTimeout(captureToCanvas, 500);
    console.log("Webcam setup finished.")
}
