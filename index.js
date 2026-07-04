const sea = document.querySelector('.sea');
const hook = document.querySelector('.hook');

let isFishing = false;
let state = "idle";
let y = 0;
let x = 0;
let caughtFish = null;
let score = 0;

const downSpeed = 3;
const upSpeed = 3;
const fishTypes = [
    {
        className: "carp",
        src: "./img/carp.svg",
        score: 10,
        speed: 3,
        depth: 200,
        width: 100
    },
    {
        className: "puffer",
        src: "./img/puffer.svg",
        score: 30,
        speed: 2,
        depth: 280,
        width: 80
    },
    {
        className: "marlin",
        src: "./img/marlin.svg",
        score: 50,
        speed: 6,
        depth: 350,
        width: 90
    },
    {
        className: "sergeant",
        src: "./img/sergeant.svg",
        score: 20,
        speed: 3,
        depth: 450,
        width: 60
    },
    {
        className: "goldfish",
        src: "./img/goldfish.svg",
        score: 25,
        speed: 3.6,
        depth: 480,
        width: 60
    },
    {
        className: "jellyfish",
        src: "./img/jellyfish.svg",
        score: 0,
        speed: 1,
        depth: 400,
        width: 50
    },
    {
        className: "seashell",
        src: "./img/seashell.svg",
        score: 60,
        speed: 0.6,
        depth: 20,
        width: 50
    },
    {
        className: "squid",
        src: "./img/squid.svg",
        score: 30,
        speed: 2.5,
        depth: 140,
        width: 70
    },
];




// 물고기 스폰

function spawnFish() {
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];

    const fish = document.createElement("div");
    const fishImg = document.createElement("img");

    const dir = Math.random() < 0.5 ? 1 : -1;

    const startX = dir === 1
        ? -type.width
        : sea.clientWidth + type.width;

    fish.className = `fish ${type.className}`;
    fish.dataset.score = type.score;
    fish.dataset.x = startX;
    fish.dataset.speed = type.speed;
    fish.dataset.dir = dir;
    fish.dataset.baseY = type.depth;
    fish.dataset.offset = Math.random() * Math.PI * 2;

    fish.style.width = `${type.width}px`;
    fish.style.bottom = `${type.depth}px`;
    fish.style.left = `${startX}px`;

    fishImg.src = type.src;
    fishImg.alt = "";

    // 오른쪽으로 갈 때 / 왼쪽으로 갈 때 방향
    fishImg.style.transform = dir === 1 ? "scaleX(-1)" : "scaleX(1)";


    fish.appendChild(fishImg);
    sea.appendChild(fish);
}

// 상승 하강 로직



function startFishing(e) {
    if (isFishing) return;
    if (!gameStarted) return;

    isFishing = true;
    state = "down";
    y = 0;
    caughtFish = null;

    const rect = sea.getBoundingClientRect();
    x = e.clientX - rect.left;

    hook.style.left = `${x}px`;
    hook.style.top = `${y}px`;
    hook.style.display = "block";

    requestAnimationFrame(update);
}

function update() {
    if (!isFishing) return;

    if (state === "down") {
        y += downSpeed;

        checkCollision();

        if (caughtFish) {
            state = "up";
        }

        if (y >= sea.clientHeight - hook.offsetHeight) {
            state = "up";
        }
    }

    if (state === "up") {
        y -= upSpeed;

        if (!caughtFish) {
            checkCollision();
        }

        if (y <= 0) {
            y = 0;
            endFishing();
            return;
        }
    }

    hook.style.top = `${y}px`;

    requestAnimationFrame(update);
}

// 충돌체크

function checkCollision() {
    const fishes = document.querySelectorAll(".sea > .fish");
    const hookRect = hook.getBoundingClientRect();

    for (const fish of fishes) {
        const fishRect = fish.getBoundingClientRect();

        if (
            hookRect.left < fishRect.right &&
            hookRect.right > fishRect.left &&
            hookRect.top < fishRect.bottom &&
            hookRect.bottom > fishRect.top
        ) {
            caughtFish = fish;

            const fishImg = fish.querySelector("img");
            const currentTransform = getComputedStyle(fishImg).transform;

            fish.style.left = "0px";

            hook.appendChild(fish);

            const fishW = (fish.offsetWidth / 2) - (hook.offsetWidth / 2);

            fish.style.bottom = "-20px";
            fish.style.transform = `translateX(${-fishW}px)`;
            fish.style.animation = "none";

            fishImg.style.animation = "none";
            fishImg.style.transform = currentTransform;

            break;
        }
    }
}

// 점수 정산 및 잡힌 물고기 제외 

function endFishing() {
    state = "idle";
    isFishing = false;
    hook.style.display = "none";

    if (caughtFish) {
        score += Number(caughtFish.dataset.score);
        scoreboard.textContent = score;
        console.log("score:", score);

        caughtFish.remove();
        caughtFish = null;

        spawnFish();
    }
}

// 물고기 움직이기 

function moveFishes() {
    const fishes = document.querySelectorAll(".sea > .fish");

    fishes.forEach(fish => {
        let x = Number(fish.dataset.x);
        const speed = getFishSpeed(fish);
        let dir = Number(fish.dataset.dir);

        x += speed * dir;

        const fishWidth = fish.offsetWidth;

        if (x > sea.clientWidth + fishWidth) {
            dir = -1;
            x = sea.clientWidth + fishWidth;
            fish.querySelector("img").style.transform = "scaleX(1)";
        }

        if (x < -fishWidth) {
            dir = 1;
            x = -fishWidth;
            fish.querySelector("img").style.transform = "scaleX(-1)";
        }

        fish.dataset.x = x;
        fish.dataset.dir = dir;

        fish.style.left = `${x}px`;
        if (fish.classList.contains("squid")) {
            const t = performance.now() / 1000;
            const offset = Number(fish.dataset.offset);
            const baseY = Number(fish.dataset.baseY);

            const triangle =
                (2 / Math.PI) * Math.asin(Math.sin((t + offset) * 5));

            const y = baseY + triangle * 40;

            fish.style.bottom = `${y}px`;
        }
    });


    requestAnimationFrame(moveFishes);
}

// 물고기 최초 스폰

const startBtn = document.getElementById("start");

let gameStarted = false;
let timeLeft = 30;

sea.addEventListener("click", startFishing);

startBtn.addEventListener("click", startGame);

function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    startBtn.style.display = "none";

    moveFishes();

    for (let i = 0; i < 6; i++) {
        setTimeout(spawnFish, i * 200);
    }

    startTimer();
}


function startTimer() {
    timeLeft = 30;
    timelimit.textContent = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        timelimit.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// 타임 종료

function endGame() {
    gameStarted = false;

    // 낚시 중이었다면 종료
    isFishing = false;

    // 필요하면 물고기 제거
    document.querySelectorAll(".fish").forEach(fish => fish.remove());

    alert("게임 종료!");
}

function getFishSpeed(fish) {
    const baseSpeed = Number(fish.dataset.speed);

    if (fish.classList.contains("sergeant") || fish.classList.contains("goldfish")) {
        const t = performance.now() / 1000;
        const offset = Number(fish.dataset.offset);

        const wave = (Math.sin((2*t + offset) * 2) + 1) / 2;

        return baseSpeed * (0.2 + wave * 0.8);
    }

    return baseSpeed;
}