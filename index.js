console.log("Lets make it")

let currentSong = new Audio();
let songs;
let currentIndex = 0;
let currFolder;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getsongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let links = div.getElementsByTagName("a")
    songs = []
    for (let link of links) {
        let href = link.getAttribute("href");
        if (href && href.toLowerCase().endsWith("mpeg")) {
            let songName = decodeURIComponent(href)
                .split(/[\\/]/)
                .pop();
            songs.push(songName.replace(/;$/, ""));
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track);
    currentIndex = songs.indexOf(track);
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

};

// show all the songs in playlist

function showPlaylist() {
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img src="music.svg" alt="" class="invert">
                            <div class="info">
                                <div>
                                ${song.replaceAll("%20", " ")}
                                </div>
                                <div>Shivam</div>
                            </div>
                            <div class="playnow ">
                                <span>Play Now</span>
                                <img src="play2.svg" alt="" class="invert">
                            </div>
                        </li>`
    }


    //Attach an eventListner to all songs

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let track = e.querySelector(".info").firstElementChild.innerHTML.trim()
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(track);

        })
    })
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/music/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        let url = decodeURIComponent(e.href).replaceAll("\\", "/");
        if (url.includes("/music")) {
            let part = url.split("/")
            let folder = (part.slice(-2)[0])

            // Get the metadata of the folder

            let a = await fetch(`http://127.0.0.1:3000/music/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card" >
                        <div class="play">
                            <img src="play.svg" alt="" class="src">
                        </div>
                        <img src="/music/${folder}/cover.jpg" alt="" class="src">
                        <h4>${response.title}</h4>
                        <p class="para1">
                            ${response.description}
                        </p>
                    </div>`


        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            console.log("Fetching Songs")
            songs = await getsongs(`music/${e.dataset.folder}`)
            document.querySelector(".left").style.left = "0"
            playMusic(songs[0])

            showPlaylist();

        })
    })
}

async function main() {
    //Get the list of all songs
    await getsongs("music/ncs")
    showPlaylist();
    playMusic(songs[0], true)

    // Display All the albums on the Page
    displayAlbums()

    //Attach an Event Listener to all play,next and previous

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play2.svg"
        }
    })

    //Listen for Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an Event Listener For Hamburgur
    document.querySelector(".hamburgur").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //For Previous and Next

    previous.addEventListener("click", () => {
        console.log("previous clicked")


        if ((currentIndex) > 0) {
            currentIndex--;
            playMusic(songs[currentIndex])
        }
    })

    next.addEventListener("click", () => {
        console.log("next clicked")
        if ((currentIndex) < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex])
        }
    })

    //Add volume tag

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src= document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click",e=>{
       if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
       }
       else{
         e.target.src = e.target.src.replace("mute.svg","volume.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
       }
    })

    // Load the Library Whenever card is Clicked


}
main()
formatTime()

