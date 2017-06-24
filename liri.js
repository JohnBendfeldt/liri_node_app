var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
var keys = require('./keys.js');
var twitter = new Twitter(keys.twitterKeys);
var spotify = new Spotify({
        id: "f0f05c75e96142f6bb5e48758aa7ed19",
        secret: "41cb634714784526a02074f89c483b2c",
});

function launch(){
inquirer.prompt([
    {   type: "list",
        name: "action",
        message: "What is your wish?",
        choices:["Get Tweets", "Spotify This", "Movie This", "Random"]
    }
]).then(function(input){
    var action = input.action;
    console.log(input.action);
    inputChoices[action]();
});
};

launch();

var inputChoices = {

	"Get Tweets": function(){ 
        twitter.get('statuses/user_timeline',{count: '20'}, function(error, tweets, response) {
            if(error) throw error;
            for (i=0; i<tweets.length; i++){
                console.log(tweets[i].user.screen_name + ": " + tweets[i].text);  
            }
            again();
        });
    },


    "Spotify This": function(){
        inquirer.prompt([
            {
                type:"input", 
                name:"song", 
                message:"What song do you want to look up?", 
            }
        ]).then(function(input){
            var spotify = new Spotify({
                id: "f0f05c75e96142f6bb5e48758aa7ed19",
                secret: "41cb634714784526a02074f89c483b2c",
            });
            spotify.search({ type: 'track', query: input.song, limit: "1" })
            .then(function(response) {
                console.log("Song: "    + response.tracks.items[0].name); 
                console.log("Artist: " + response.tracks.items[0].artists[0].name);
                console.log("Album: "   + response.tracks.items[0].album.name);
                console.log("Preview: " + response.tracks.items[0].preview_url);
                again();
            })
            .catch(function(err) {
                console.log(err);
            });
        });
     },


    "Movie This": function(){
        inquirer.prompt([
            {   type:"input", 
                name:"movie", 
                message:"What movie do you want to look up?", 
            }
        ]).then(function(input){
            var queryUrl = "http://www.omdbapi.com/?apikey=40e9cece&t=" + input.movie + "&y=&plot=short&r=json";
            request(queryUrl, function(error, response, body){

                if(!error && response.statusCode === 200){
                    console.log("Title: "        + JSON.parse(body).Title);
                    console.log("Release Year: " + JSON.parse(body).Year);
                    console.log("Rating: "       + JSON.parse(body).imdbRating);
                    console.log("Plot: "         + JSON.parse(body).Plot);
                    console.log("Actors: "       + JSON.parse(body).Actors)
                    console.log("Language: "     + JSON.parse(body).Language);
                    console.log("Country: "      + JSON.parse(body).Country);
                    console.log("Website: "      + JSON.parse(body).Website);
                    again();
                }
            });
        });
     },


    "Random": function(){
        var action, song; 
        fs.readFile("random.txt", "utf-8", function(err, data){
            var spotify = new Spotify({
                id: "f0f05c75e96142f6bb5e48758aa7ed19",
                secret: "41cb634714784526a02074f89c483b2c",
                });
            if(err){
                return undefined;
            }
            console.log(data);
            var dataArr = data.split(",");
            action = dataArr[0], song = dataArr[1]

            spotify.search({ type: 'track', query: dataArr[1], limit: "1" })
            .then(function(response) {
                console.log("Song: "    + response.tracks.items[0].name); 
                console.log("Artist: " + response.tracks.items[0].artists[0].name);
                console.log("Album: "   + response.tracks.items[0].album.name);
                console.log("Preview: " + response.tracks.items[0].preview_url);
                again();
            })
            .catch(function(err) {
                console.log(err);
            });
        })
     },
	
}

function again() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'playAgain',
        message: 'Wanna go again?'
    }]).then(function(answers) {
        if(answers.playAgain) {
            launch();
        }
    })
}
