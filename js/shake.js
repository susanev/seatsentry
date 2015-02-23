// callback takes form of callback(bool) where a shake is detected

function startShakeDetection(callback) {

    var lastVals = [0.0,0.0,0.0,0.0,0.0];

    var relayr = RELAYR.init({
        appId: "71407337-1f21-406a-9529-e58151979915"
    });

    // accelerometer
    relayr.devices().getDeviceData(
    {
        deviceId: "67c656c3-08d3-43ff-be2a-d434f07dd61e", 
        token: "vTP_EUdBJzdrz.digPRyNM82VEuLfqY6",
        incomingData: function(data){
        console.log("sensor",data);
        console.log("Accelerometer X:"+data.accel.x+" Y:"+data.accel.y+" Z:"+data.accel.z);
        console.log("Gyro X:"+data.gyro.x+" Y:"+data.gyro.y+" Z:"+data.gyro.z);
        /*$('#accel-x').text(data.accel.x);
        $('#accel-y').text(data.accel.y);
        $('#accel-z').text(data.accel.z);
        $('#gyro-x').text(data.gyro.x);
        $('#gyro-y').text(data.gyro.y);
        $('#gyro-z').text(data.gyro.z);*/
        lastVals.push(data.accel.x);
        lastVals.shift();

        // accel-x if value switches from positive to negative greatly it's shaking
        // a shake is defined as switch from negative to positive and back (or vice versa)
        /*if(detectShake()) {
            $('#shaked').text("YOUR BABY IS SHAKING");
        }
        else {
            $('#shaked').text("Your baby is safe.");
        }*/
        callback(detectShake());
    }
    });   

    function detectShake() {
        var highest = 0.0;
        var lowest = 0.0;
        // find the highest positive number and lowest negative
        // if the difference beween them is > .5, that's a shake
        for(var i=0; i<lastVals.length; i++) {
            var val = lastVals[i];
            if(val > highest)
                highest = val;
            else if(val < lowest)
                lowest = val;
        }
        if(highest < 0.1 || lowest > -0.1)
            return false;
        if(highest - lowest > .5) {
            console.log("SHAKE");
            return true   
        }

        return false;
    }
}