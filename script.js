document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('videoElement');
    const startScanButton = document.getElementById('startScan');
    const toggleCameraButton = document.getElementById('toggleCamera');
    const closeButton = document.querySelector('.close');
    const copyButton = document.querySelector('.copy');
    const textarea = document.querySelector('textarea');
  
    let stream;
    let scanning = false;
    let currentCamera = 'environment';
  
    startScanButton.addEventListener('click', startQRScan);
  
    toggleCameraButton.addEventListener('click', () => {
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        if (scanning) {
            stopCamera();
            startQRScan();
        }
    });
  
    closeButton.addEventListener('click', () => {
        stopCamera();
        document.querySelector('.wrapper').classList.remove('active');
        scanning = false;
    });
  
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(textarea.value);
    });
  
    async function startQRScan() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentCamera } });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                console.log('Video dimensions:', video.videoWidth, video.videoHeight); // Debug video dimensions
                document.querySelector('.wrapper').classList.add('active');
                scanning = true;
                scanQRCode();
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access the camera.');
        }
    }
  
    function scanQRCode() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        function scan() {
            if (!scanning) return;
  
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
  
            // Ensure that the canvas and context are properly sized
            if (canvas.width === 0 || canvas.height === 0) {
                requestAnimationFrame(scan);
                return;
            }
  
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  
            try {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
  
                if (code) {
                    console.log('QR Code found:', code.data); // Debug: Log found QR code
                    textarea.value = code.data;
                    stopCamera();
                } else {
                    console.log('No QR Code found'); // Debug: Log when no QR code is found
                    requestAnimationFrame(scan);
                }
            } catch (error) {
                console.error('Error processing image data:', error);
                requestAnimationFrame(scan);
            }
        }
  
        requestAnimationFrame(scan);
    }
  
    function stopCamera() {
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            stream = null;
        }
    }
  });
  
  