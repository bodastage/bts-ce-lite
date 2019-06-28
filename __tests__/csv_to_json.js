const csv=require('csvtojson')
csvFile = process.argv[0]

csv()
.fromStream(csvFile)
.subscribe((json)=>{
    return new Promise((resolve,reject)=>{
        console.log(json);
    })
},onError,onComplete);
 
 
 