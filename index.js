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
        speed: 5,
        depth: 200
    },
    {
        className: "puffer",
        src: "./img/puffer.svg",
        score: 30,
        speed: 7,
        depth: 280
    },
    {
        className: "marlin",
        src: "./img/marlin.svg",
        score: 80,
        speed: 3,
        depth: 350
    }
];






// 점수 정산 및 잡힌 물고기 제외 


// 물고기 스폰

function spawnFish() {
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];

    const fish = document.createElement("div");

    fish.className = `fish ${type.className}`;
    fish.dataset.score = type.score;

    fish.style.bottom = `${type.depth}px`;
    fish.style.animationDuration = `${type.speed}s`;

    fish.innerHTML = `<img src="${type.src}" alt="">`;

    const fishImg = fish.querySelector('img');
    fishImg.style.animationDuration = `${type.speed}s`;

    sea.appendChild(fish);
}

// 상승 하강 로직

sea.addEventListener("click", startFishing);


function startFishing(e) {
    if (isFishing) return;

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

        checkCollision();

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