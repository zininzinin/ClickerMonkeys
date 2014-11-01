// ==UserScript==
// @id          ClickerMonkeys
// @name        Clicker Monkeys
// @namespace   .
// @version     1.1
// @authors     Zininzinin, unv_annihilator
// @description Trying to automate ALL THE THINGS with clicker heroes
// @include     http://www.clickerheroes.com/
// @grant       none
// @require     http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

(function () {
    "use strict";
    
    var main = function () {
        "use strict";
        
        var JSMod = null;
        var loadAttempts = 0;
        var maxAttempts = 100;
        var loadTimeout = 10000;
        
        //Do Not Change
        var baseCosts = [10, 50, 250, 1000, 4000, 20000, 100000, 400000, 2500000, 15000000, 100000000, 800000000, 6500000000, 50000000000, 450000000000, 4000000000000, 36000000000000, 320000000000000, 2700000000000000, 24000000000000000, 300000000000000000, 9000000000000000000, 350000000000000000000, 1.4e+22, 4.19999999999999e+24, 2.1e+27];
        var zoneTimer = 0;
        var currentZone = 0;
        
        //Set What you want as your max level
        var MLevel = 150;
        
        //IDs of the gilded heroes (Cid is 0)
        var guildedList = [6];
        
        //set to 1 if you do not have dogcog and set to 0.5 if max level.
        var dogcog = 1;
        
        //Basically how fast it levels up heroes. Set interval higher for slower repeats. Recommended minimum value 10.
        var purchaseInterval = 100;
        
        //How often to check if you should ascend in miliseconds. Default is 30 seconds.
        var ascendInterval = 30000;
        
        //How long (in seconds) to wait for changezone before ascending. Example: If timeout is 60 seconds and it takes you longer than 60 seconds to defeat a zone you will ascend.
        var ascendTimeout = 60;
        
        //Will not ascend before you have reached this zone
        var minAscendZone = 100;
        
        //How often to try to buy all upgrades
        var upgradeInterval = 10000;
        
        var App = {
            name: "Clicker Monkeys",
            onPlaying: function () {
                setInterval(purchaseHighest,purchaseInterval);
                setInterval(JSMod.buyAllAvailableUpgrades,upgradeInterval);
                setInterval(tryAscend,ascendInterval);
                // TODO: Check if Progress mode is available.
                //   	And if it's not then auto-progress when level complete.
                JSMod.setProgressMode(true);
            },
            onSelectedZone: function (zone) {
                zoneTimer = Date.now();
                currentZone = zone;
                console.log("New zone: " + zone + " at time " + zoneTimer);
            }
        };
        
        function tryAscend() {
            var timeout = Date.now() - zoneTimer / 1000;
            console.log("Trying to ascend. Timeout is " + timeout);
            if (currentZone >= minAscendZone && (timeout > ascendTimeout)) {
                JSMod.ascend();
                // TODO: Check if Progress mode is available.
                //   	And if it's not then auto-progress when level complete.
                JSMod.setProgressMode(true);
            }
        }
        
        function calculateHeroCost(id) {
			var level = JSON.parse(JSMod.getUserData()).heroCollection.heroes[id+1].level;
			return calculateHeroCost(id, level);
        }
        
		function calculateHeroCost(id, level) {
            if (id === 0 && level <= 15) {
                return Math.floor((5 + level) * Math.pow(1.07, level) * dogcog);
            } else if (id === 0) {
                return Math.floor(20 * Math.pow(1.07, level) * dogcog);
            } else {
                return Math.floor(baseCosts[id] * Math.pow(1.07, level) * dogcog);
            }
        }
		
        function canPurchaseHero(id) {
			return canPurchaseHero(id, (JSON.parse(JSMod.getUserData())).gold);
        }
        
        function canPurchaseHero(id, gold) {
            return (gold > calculateHeroCost(id)) && (save.heroCollection.heroes[id+1].level < MLevel || isGuilded(guildedList, id));
        }
        
        function isGuilded(guildedList, heroID) {
			for (var i = 1; i < guildedList.length; i++) {
				if (guildedList[i] == heroID) {
                    return true;
                }
			}
			return false;
        }
		
        function purchaseCheapest() {
            var heroCosts = [];
            var currentGold = JSON.parse(JSMod.getUserData()).gold;
			var heroCollection = JSON.parse(JSMod.getUserData()).heroCollection;
            for (var i = 0; i < 26; i++) {
                if (heroCollection.heroes[i+1].level < MLevel || isGuilded(guildedList, i)) {
                    heroCosts[i] = calculateHeroCost(i, heroCollection.heroes[i+1].level);
                } else {
                    heroCosts[i] = Number.MAX_VALUE;
                }
            }
            if (currentGold > Math.min.apply(Math,heroCosts)) {
                JSMod.levelHero(heroCosts.indexOf(Math.min.apply(Math,heroCosts)) + 1);
            }
        }
        
        function purchaseHighest() {
            var heroCost;
			var currentGold = JSON.parse(JSMod.getUserData()).gold;
			var heroCollection = JSON.parse(JSMod.getUserData()).heroCollection;
            for (var i = 25; i > 0; i--) {
                if(heroCollection.heroes[i+1].level < MLevel || isGuilded(guildedList, i)) {
                    heroCost = calculateHeroCost(i, heroCollection.heroes[i+1].level);
                    if (currentGold > heroCost) {
                        JSMod.levelHero(i + 1);
                        break;
                    }
                }
            }
        }
        //******************************
        
        function init() {
            if (window.JSMod === undefined) {
                if (loadAttempts++ < maxAttempts) {
                    window.setTimeout(init, loadTimeout/maxAttempts);
                } else {
                    alert("Failed to load " + App.name + "! Cannot find JSMod object on global scope");
                }
            } else {
                JSMod = window.JSMod;
                JSMod.loadApp(App);
            }
        }
        
        init();
    };
    
    function inject(func) {
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.appendChild(document.createTextNode("(" + func + ")();"));
        $("head").append(script)[0].removeChild(script);
    }
    
    $(inject(main));
})();