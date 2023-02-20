
require("dotenv").config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceid=process.env.SERVICE_ID;
const client = require('twilio')(accountSid, authToken);
const promise=require("promise")


module.exports={
    sendOtp:(mobile)=>{
        console.log("sending otp")
        console.log(mobile)
        client.verify.v2.services(serviceid)
        .verifications
        .create({ to: `+91${mobile}`, channel:'sms'})
        .then((verification) => console.log(verification.status));
        
    },
    verifyOtp:(mobile,otp)=>{
        console.log(mobile+"hi" +otp)
        return new promise((resolve,reject)=>{
            console.log("here in before verifying")
            client.verify.v2.services(serviceid)
            .verificationChecks.create({ to:`+91${mobile}`,code:otp})
            .then((verification_check)=>{
                console.log("here in verifying")
                console.log(verification_check.status);
                resolve(verification_check)
            })
        })
    }
    
}


// function verifyOtp(){

//     client.verify.v2.services('VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
//     .verificationChecks
//     .create({to: '+15017122661', code: '123456'})
//     .then(verification_check => console.log(verification_check.status));

// }
    




    






