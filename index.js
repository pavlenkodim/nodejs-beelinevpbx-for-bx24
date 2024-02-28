const axios = require("axios").default;
const fs = require("fs");
const Buffer = require("node:buffer")

const compare_users = require("./compare_users.json");
const config = require("./config.json");


// TODO: Refactor this "date" and "today".
const date = new Date();
const today = {
    str : `${date.getFullYear()}-${date.getMonth() > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`,
    strUTC : `${date.getFullYear()}-${date.getMonth() > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`,
    strYMD : `${date.getFullYear()}_${date.getMonth() > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)}_${date.getDate()}`,
    strDMY : `${date.getDate()}_${date.getMonth() > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)}_${date.getFullYear()}`
}

main();

function main() { // TODO: Сделать функцию сборщиком всех других функций.
    console.log("Im work!");
}

async function getToken () {
    try {
        return await axios.post('https://cloudpbx.beeline.kz/VPBX/Account/GetToken', config.beeVPBX.auth)
    } catch (error) {
        console.warn(error.response.data);
    }
}

async function callLog(token) {
    try {
        const response = await axios({
            method: "post",
            url: "http://cloudpbx.beeline.kz/VPBX/Stat/CallLog",
            headers: {
                'X-VPBX-API-AUTH-TOKEN' : `${config.beeVPBX.api_token}`,
                Cookie: `BearerToken=${token}`
            },
            data: {
                page: 1,
                limit: 100,
                orderBy: "StartDT",
                ascending: false,
                query: {
                    // Direction: "inbound", // TODO: Проверить как работет без этого параметра. Нужно брать все звонки.
                    ProfileID: config.beeVPBX.profileID,
                    StartDT: {
                        start: today.str,
                        end: `${today.strYMD} 13:35:20.000`
                    }
                }
            }
        });
        console.log(await response.data);
        return await response.data;
    } catch (error) {
        console.warn(error);
    }
}

async function getAudio(data, token) {
    try {
        const response = await axios({
            method: "get",
            url: "http://cloudpbx.beeline.kz/VPBX/Cloud/GetCallRecordContent",
            headers: {
                'X-VPBX-API-AUTH-TOKEN' : `${config.beeVPBX.api_token}`,
                Cookie: `BearerToken=${token}`
            },
            params: {
                sipCallId: data.CALL_ID,
                asPreview: false
            }
        });
        console.log(await response.data);
        return await response.data;
    } catch (error) {
        console.warn(error.response.data);
    }
}

function callRegister({
    user_phone_number,
    user_id,
    phone_number,
    call_start_date,
    type,
    crm_create = 1,
    crm_source,
    crm_entity_type,
    crm_entity_id,
    show = 0
}) {
     axios.post(`https://bitrix.triline.kz/rest/${config.bitrix.user}/${config.bitrix.token}/telephony.externalcall.register.json`,{
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
    .catch(error => {
        console.error(error);
    })
}

function callFinish ({call_id, user_id, duration, cost = 0.00, cost_currency = 'KZT', failed_reaction, record_url, vote, add_to_chat = 0}) {
    axios.post(`https://bitrix.triline.kz/rest/${config.bitrix.user}/${config.bitrix.token}/telephony.externalcall.finish.json`, {
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
        fs.appendFile(`./tmp/log_${today.strDMY}.txt`, `\n${JSON.stringify(res.data)}`, err => {
            if (err) throw err;
            console.log('Log is done!');
        });
    })
    .catch(error => {
        console.error(error);
    })
    .finally(res => { // TODO: Необходимо настроить логирование

    });
}

function setLog(res, func = '') {
    fs.appendFile(`./tmp/log_${today.strDMY}.txt`, `\n${func}: ${JSON.stringify(res.data)}`, err => {
        if (err) throw err;
    });
}