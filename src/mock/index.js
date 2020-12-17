import Mock from 'mockjs'

Mock.mock(/\/api\/getUserSetting.htm/,"post",require("./getUserSetting.json"))
Mock.mock(/\/api\/searchInfo.htm/,"post",require("./searchInfo.json"))
Mock.mock(/\/nfrtc\/rtc.htm/,"post",require("./rtc.json"))
Mock.mock(/\/friends\/list.htm/,"post",require("./list.json"))
Mock.mock(/\/imMsg\/getSessionList.htm/,"post",require("./getSessionList.json"))
Mock.mock(/\/group\/getBatchGroupSettingV2.htm/,"post",require("./getBatchGroupSettingV2.json"))
Mock.mock(/\/imMsg\/getSession.htm/,"post",require("./getSession.json"))
Mock.mock(/\/group\/listUser.htm/,"post",require("./listUser.json"))
Mock.mock(/\/imMsg\/getMsgMinId.htm/,"post",require("./getMsgMinId.json"))
Mock.mock(/\/imMsg\/getMsgMinId.htm/,"post",require("./getMsgMinId.json"))
