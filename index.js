const axios = require("axios").default;
const fs = require("fs");
const Buffer = require("node:buffer")

const compare_users = require("./compare_users.json");
const config = require("./config.json");

function getToken (login, password) {
    axios.post('https://cloudpbx.beeline.kz/VPBX/Account/GetToken', {
        'login': login,
        'password': password
    })
    .then(res => {
        console.log(res.data);
        return res.data;
    }).
    catch(error => {
        console.log(error);
    });
}

function callRegister({user_phone_number, user_id, phone_number, call_start_date, type, crm_create = 1, crm_source, crm_entity_type, crm_entity_id, show = 0}) {
     axios.post(`https://bitrix.triline.kz/rest/${config.user}/${config.token}/telephony.externalcall.register.json`,{
        "USER_PHONE_INNER": user_phone_number,
        "USER_ID": user_id,
        "PHONE_NUMBER": phone_number,
        "CALL_START_DATE": call_start_date,
        "CRM_CREATE": crm_create,
        "CRM_SOURCE": crm_source,
        "SHOW": show,
        "TYPE": type
    })
    .then(res => {
        console.log(res.data);
        return res.data;
    })
}



function callFinish ({call_id, user_id, duration, cost = 0.00, cost_currency = 'KZT', failed_reaction, record_url, vote, add_to_chat = 0}) {
    axios.post(`https://bitrix.triline.kz/rest/${config.user}/${config.token}/telephony.externalcall.finish.json`, {
        "CALL_ID": call_id,
        "USER_ID": user_id,
        "DURATION": duration,
        "COST": cost,
        "COST_CURRENCY": cost_currency,
        "STATUS_CODE": "VI_STATUS_OTHER",
        "FAILED_REASON": failed_reaction,
        "RECORD_URL": record_url,
        "VOTE": vote,
        "ADD_TO_CHAT": add_to_chat
    })
    .then(res => {
        console.log(res.data);
    });
}

function main() {
    axios.get(`https://bitrix.triline.kz/rest/${config.user}/${config.token}/profile.json`)
        .then(res => {
            // console.log(res.data);
            // const data = new Uint8Array(Buffer.from('Hello Node.js'));
            // fs.writeFile("./tmp/logs.txt", data, 'utf8', (err) => {
            //     console.error(err);
            // })
        });
}

main();

fs.appendFileAsync("./tmp/logs.txt", "Hello world!", err => {
    if (err) throw err;
    console.log('Done');
});