SCHEMCore = nil
TriggerEvent('SCHEMCore:GetObject', function(obj) SCHEMCore = obj end)

RegisterServerEvent('schemkes-multicharacter:server:disconnect')
AddEventHandler('schemkes-multicharacter:server:disconnect', function()
    local src = source

    DropPlayer(src, "You have disconnected from Schemkes Framework")
end)

RegisterServerEvent('schemkes-multicharacter:server:loadUserData')
AddEventHandler('schemkes-multicharacter:server:loadUserData', function(cData)
    local src = source
    if SCHEMCore.Player.Login(src, cData.citizenid) then
        print('^2[schemkes-core:LOG]^7 '..GetPlayerName(src)..' (Citizen ID: '..cData.citizenid..') has succesfully loaded!')
        SCHEMCore.Commands.Refresh(src)
        loadHouseData()
		--TriggerEvent('SCHEMCore:Server:OnPlayerLoaded')-
        --TriggerClientEvent('SCHEMCore:Client:OnPlayerLoaded', src)
        
        TriggerClientEvent('apartments:client:setupSpawnUI', src, cData)
        TriggerEvent("schemkes-log:server:sendLog", cData.citizenid, "characterloaded", {})
        TriggerEvent("schemkes-log:server:CreateLog", "joinleave", "Loaded", "green", "**".. GetPlayerName(src) .. "** ("..cData.citizenid.." | "..src..") loaded..")
	end
end)

RegisterServerEvent('schemkes-multicharacter:server:createCharacter')
AddEventHandler('schemkes-multicharacter:server:createCharacter', function(data)
    local src = source
    local newData = {}
    newData.cid = data.cid
    newData.charinfo = data
    --SCHEMCore.Player.CreateCharacter(src, data)
    if SCHEMCore.Player.Login(src, false, newData) then
        print('^2[schemkes-core:LOG]^7 '..GetPlayerName(src)..' has succesfully loaded!')
        SCHEMCore.Commands.Refresh(src)
        loadHouseData()

        TriggerClientEvent("schemkes-multicharacter:client:closeNUI", src)
        TriggerClientEvent('apartments:client:setupSpawnUI', src, newData)
        GiveStarterItems(src)
	end
end)

function GiveStarterItems(source)
    local src = source
    local Player = SCHEMCore.Functions.GetPlayer(src)

    for k, v in pairs(SCHEMCore.Shared.StarterItems) do
        local info = {}
        if v.item == "id_card" then
            info.citizenid = Player.PlayerData.citizenid
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.gender = Player.PlayerData.charinfo.gender
            info.nationality = Player.PlayerData.charinfo.nationality
        elseif v.item == "driver_license" then
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.type = "A1-A2-A | AM-B | C1-C-CE"
        end
        Player.Functions.AddItem(v.item, 1, false, info)
    end
end

RegisterServerEvent('schemkes-multicharacter:server:deleteCharacter')
AddEventHandler('schemkes-multicharacter:server:deleteCharacter', function(citizenid)
    local src = source
    SCHEMCore.Player.DeleteCharacter(src, citizenid)
end)

SCHEMCore.Functions.CreateCallback("schemkes-multicharacter:server:GetUserCharacters", function(source, cb)
    local steamId = GetPlayerIdentifier(source, 0)

    exports['ghmattimysql']:execute('SELECT * FROM players WHERE steam = @steam', {['@steam'] = steamId}, function(result)
        cb(result)
    end)
end)

SCHEMCore.Functions.CreateCallback("schemkes-multicharacter:server:GetServerLogs", function(source, cb)
    exports['ghmattimysql']:execute('SELECT * FROM server_logs', function(result)
        cb(result)
    end)
end)

SCHEMCore.Functions.CreateCallback("test:yeet", function(source, cb)
    local steamId = GetPlayerIdentifiers(source)[1]
    local plyChars = {}
    
    exports['ghmattimysql']:execute('SELECT * FROM players WHERE steam = @steam', {['@steam'] = steamId}, function(result)
        for i = 1, (#result), 1 do
            result[i].charinfo = json.decode(result[i].charinfo)
            result[i].money = json.decode(result[i].money)
            result[i].job = json.decode(result[i].job)

            table.insert(plyChars, result[i])
        end
        cb(plyChars)
    end)
end)

SCHEMCore.Commands.Add("logout", "Geef het karaktermenu aan een speler", {{name="id", help="Speler ID"}}, false, function(source, args)
    SCHEMCore.Player.Logout(source)
    TriggerClientEvent('schemkes-multicharacter:client:chooseChar', source)
end, "admin")

SCHEMCore.Commands.Add("closeNUI", "Geef een item aan een speler", {{name="id", help="Speler ID"},{name="item", help="Naam van het item (geen label)"}, {name="amount", help="Aantal items"}}, false, function(source, args)
    TriggerClientEvent('schemkes-multicharacter:client:closeNUI', source)
end)

SCHEMCore.Functions.CreateCallback("schemkes-multicharacter:server:getSkin", function(source, cb, cid)
    local src = source

    SCHEMCore.Functions.ExecuteSql(false, "SELECT * FROM `playerskins` WHERE `citizenid` = '"..cid.."' AND `active` = 1", function(result)
        if result[1] ~= nil then
            cb(result[1].model, result[1].skin)
        else
            cb(nil)
        end
    end)
end)

function loadHouseData()
    local HouseGarages = {}
    local Houses = {}
	SCHEMCore.Functions.ExecuteSql(false, "SELECT * FROM `houselocations`", function(result)
		if result[1] ~= nil then
			for k, v in pairs(result) do
				local owned = false
				if tonumber(v.owned) == 1 then
					owned = true
				end
				local garage = v.garage ~= nil and json.decode(v.garage) or {}
				Houses[v.name] = {
					coords = json.decode(v.coords),
					owned = v.owned,
					price = v.price,
					locked = true,
					adress = v.label, 
					tier = v.tier,
					garage = garage,
					decorations = {},
				}
				HouseGarages[v.name] = {
					label = v.label,
					takeVehicle = garage,
				}
			end
		end
		TriggerClientEvent("schemkes-garages:client:houseGarageConfig", -1, HouseGarages)
		TriggerClientEvent("schemkes-houses:client:setHouseConfig", -1, Houses)
	end)
end