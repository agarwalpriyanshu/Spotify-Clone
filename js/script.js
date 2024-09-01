console.log("Hello")

let currentSong = new Audio();
let songs;
let currFolder;
let initialvolume = document.querySelector(".range").getElementsByTagName("input")[0].value;;

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted string
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
    let response = await a.text();
    //console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    //console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    
    }
    //console.log(songs);

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    //console.log(songUL);
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replaceAll("%26", " &")}</div>
                                <div>Priyanshu</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div> </li>`;
    }

    //Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);

        })
    });

    return songs;
}

const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    //console.log(div);

    let albums = div.getElementsByTagName("a");
    //console.log(albums);

    let cardcontainer = document.querySelector(".cardContainer");

    let array = Array.from(albums);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        //console.log(e.href);
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            //console.log(folder);
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            //console.log(response);
            
            cardcontainer.innerHTML = cardcontainer.innerHTML + `
            <div data-folder=${folder} class="card">
            
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="40" height="40">
            <circle cx="14" cy="14" r="14" fill="#fff" />
            <path
            d="M18.8906 13.846C18.5371 15.189 16.8667 16.138 13.5257 18.0361C10.296 19.8709 8.6812 20.7884 7.37983 20.4196C6.8418 20.2671 6.35159 19.9776 5.95624 19.5787C5 18.6139 5 16.7426 5 13C5 9.2574 5 7.3861 5.95624 6.42132C6.35159 6.02245 6.8418 5.73288 7.37983 5.58042C8.6812 5.21165 10.296 6.12907 13.5257 7.96393C16.8667 9.86197 18.5371 10.811 18.8906 12.154C19.0365 12.7084 19.0365 13.2916 18.8906 13.846Z"
            fill="#000000" transform="translate(2,2)" />
            </svg>
            </div>
            
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`
        }
    }
        //Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach((e) => {
            e.addEventListener("click", async (item) => {
                //console.log(item.currentTarget)
                console.log(item.currentTarget.dataset.folder)
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
}

async function main() {

    //Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    //Display all the albums on the page
    displayAlbums();

    //Attach an event listner to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "images/play.svg"
        }
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", (a) => {
        //console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    //Add an event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //Add an event listner to previous
    previous.addEventListener("click", () => {
        //console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    //Add an event listner to next
    next.addEventListener("click", () => {

        //currentSong.pause();
        //console.log(currentSong)
        //console.log(currentSong.src.split("/").slice(-1)[0]);
        //console.log(songs);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        //console.log(songs,index);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    //Add an event listemer to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //console.log(document.querySelector(".range").getElementsByTagName("input")[0]);
        console.log("Setting volume to", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
        initialvolume = document.querySelector(".range").getElementsByTagName("input")[0].value;

        if(currentSong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute", "volume");
        }
    });

    //Add event listner to mute the track
    
    document.querySelector(".volume > img").addEventListener("click", (e)=>{
        //console.log(e.target);
        //console.log(initialvolume);
        if(e.target.src.includes("images/volume.svg")){
            e.target.src = e.target.src.replace("volume", "mute");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            //console.log(initialvolume);
        }
        else{
            //console.log(initialvolume);
            e.target.src = e.target.src.replace("mute", "volume");
            currentSong.volume = initialvolume/100;
            document.querySelector(".range").getElementsByTagName("input")[0].value = initialvolume;
        }
    });

}

main();