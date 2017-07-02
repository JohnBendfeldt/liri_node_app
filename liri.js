var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
// Grabs my keys to access the twitter API
var keys = require('./keys.js');
var twitter = new Twitter(keys.twitterKeys);

// Establishes how the app starts with a prompt
function launch(){
inquirer.prompt([
    {   type: "list",
        name: "action",
        message: "What is your wish?",
        choices:["Get Tweets", "Spotify This", "Movie This", "Random"]
    }
]).then(function(input){
    // Establishes how the action works after the input choice is made
    var action = input.action;
    console.log(input.action);
    inputChoices[action]();
});
};
launch();
// The input choices that gives the user infromation
var inputChoices = {

	"Get Tweets": function(){ 
        // Calls the twitter API to get my last 20 tweets
        twitter.get('statuses/user_timeline',{count: '20'}, function(error, tweets, response) {
            if(error) throw error;
            for (var i=0; i<tweets.length; i++){
                // Displays the tweets
                console.log(tweets[i].user.screen_name + ": " + tweets[i].text);  
            }
            // Asks user is they want to go again
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
            // The spotify API needs the id/secret run each time so I nested it in the function, It would only work once as a global variable
            var spotify = new Spotify({
                id: "f0f05c75e96142f6bb5e48758aa7ed19",
                secret: "41cb634714784526a02074f89c483b2c",
            });
            // Searches for the song information to console log
            spotify.search({ type: 'track', query: input.song, limit: "1" })
            .then(function(response) {
                console.log("Song: "    + response.tracks.items[0].name); 
                console.log("Artist: " + response.tracks.items[0].artists[0].name);
                console.log("Album: "   + response.tracks.items[0].album.name);
                console.log("Preview: " + response.tracks.items[0].preview_url);
                // Asks user if they want to go again
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
            // Establishes the query url to look into the database based on the movie the user aks for
            var queryUrl = "http://www.omdbapi.com/?apikey=40e9cece&t=" + input.movie + "&y=&plot=short&r=json";
            // Processes the request
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
                    // Asks if they wanna go again
                    again();
                }
            });
        });
     },


    "Random": function(){
        // Establishes the action for the function to work
        var action, song; 
        // Read the file to ask for the data
        fs.readFile("random.txt", "utf-8", function(err, data){
            var spotify = new Spotify({
                id: "f0f05c75e96142f6bb5e48758aa7ed19",
                secret: "41cb634714784526a02074f89c483b2c",
                });
            if(err){
                return undefined;
            }
            console.log(data);
            // Splits the information in the file to just search for the song title, splits the info at the comma
            var dataArr = data.split(",");
            // Establishes the action for the function to work
            action = dataArr[0], song = dataArr[1]
            // Initializes the spotify API search
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
// Gives the option to go again
function again() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'playAgain',
        message: 'Wanna go again?'
    }]).then(function(answers) {
        // If they answer yes it launches the app again
        if(answers.playAgain) {
            launch();
        }
    })
}
