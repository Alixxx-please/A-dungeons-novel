import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/select.ts"
import osPaths from 'https://deno.land/x/os_paths@v7.4.0/src/mod.deno.ts'
import { ensureFile } from "https://deno.land/std@0.190.0/fs/ensure_file.ts";
import { keypress, KeyPressEvent } from "https://deno.land/x/cliffy@v0.25.7/keypress/mod.ts"
import ennemies from 'https://raw.githubusercontent.com/Alixxx-please/A-dungeons-novel/main/JSONs/ennemies.json' assert { type: "json" }
import heroes from 'https://raw.githubusercontent.com/Alixxx-please/A-dungeons-novel/main/JSONs/heroes.json' assert { type: "json" }
import dialogues from 'https://raw.githubusercontent.com/Alixxx-please/A-dungeons-novel/main/JSONs/dialogues.json' assert { type: "json" }



// -------------------------------------variables---------------------------------
const chooseRandom = Math.floor(Math.random() * ennemies.length)
const randomEnnemy = ennemies[chooseRandom]

const gameHome = osPaths.home() + '/Documents/ADungeonsNovel/'

let fightState = false

let spacePressed = false

let inBattle = false

//let selectedDialogues: string[] = []

interface Dialogues {
    [key: string]: string[];
}
const dialoguesTyped: Dialogues = dialogues

ensureFile(`${gameHome}` + 'JSONs/dialogues.json')
ensureFile(`${gameHome}` + 'JSONs/ennemies.json')
ensureFile(`${gameHome}` + 'JSONs/heroes.json')
ensureFile(`${gameHome}` + 'JSONs/options.json')

//-------------------------------------------fin variables---------------------------------


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function animateText(text: string, delay?: number) {
    for (const char of `${text} \n`) {
        if (spacePressed) {
            console.clear()
            break
        }
        await sleep(44 || delay)
        Deno.stdout.writeSync(new TextEncoder().encode(char))    
    }
}


async function jsonWrite(text: Record<string, unknown>, destination: string) {
    const jsonContent = JSON.parse(await Deno.readTextFile(destination))
    Object.assign(jsonContent, text)
    await Deno.writeTextFile(destination, JSON.stringify(jsonContent, null, '\t'));
}


//---------------------------------------ajouter xp------------------------------------
async function addXp() {
    console.clear()
    await animateText(`Good job! Your ennemy had ${randomEnnemy.xp}xp on him, take it! \n`)

    heroes.xp += randomEnnemy.xp
    await Deno.writeTextFile(`${gameHome}` + 'JSONs/heroes.json', JSON.stringify(heroes, null, '\t'))
    await animateText(`*You now have ${heroes.xp}xp*`)
    await sleep(2000)
    console.clear()

    const xpPerLevel = 100;
    if (heroes.xp >= xpPerLevel) {
        await jsonWrite({
        hp: heroes.hp += 10,
        speed: heroes.speed += 1,
        strengh: heroes.strengh += 5,
        xp: heroes.xp =- 100
        }, `${gameHome}` + 'JSONs/heroes.json')
        // Level up the hero by increasing their stats
        
    }
}
//-------------------------------------------fin ajouter xp---------------------------------------


//--------------------------------------------ce qui touche aux dialogues------------------------------
async function mainDialogue() {

    keypress().addEventListener("keydown", (event: KeyPressEvent) => {
        if (event.key === 'space') {
            spacePressed = true;
            console.clear()
        }
    })

    const json = JSON.parse(await Deno.readTextFile(`${gameHome}` + 'JSONs/options.json'))
    let textPosition = json.textIndex
    const selectedLanguage: string = json.language

    for (let i = textPosition; i < dialoguesTyped[selectedLanguage].length; i++) {
        if (!inBattle) {
            const text = dialoguesTyped[selectedLanguage][i]
            console.clear()
            await animateText(`${text} \n`)
            await sleep(1000)

            if (spacePressed) {
                spacePressed = false;
                textPosition++
                await jsonWrite({ textIndex: textPosition }, `${gameHome}` + 'JSONs/options.json')
                continue;
            } else {
                textPosition++
                await jsonWrite({ textIndex: textPosition }, `${gameHome}` + 'JSONs/options.json')
            }

            if (textPosition == 7) {
                await fighting()
            }
        }  
    }
    keypress().dispose()
    Deno.exit()
}
//-------------------------------fin ce qui touche aux dialogues-----------------------------------






async function mainMenu() {
    const menu: string = await Select.prompt({
        message: "Main menu",
        search: true,
        options: [
          { name: "Play", value: "play" },
          { name: "Options", value: "options" },
          { name: "Quit game", value: "quit game" },
        ],
    })

    if (menu == 'play') {
        mainDialogue()
    }

    if (menu == 'options') {
        
        const insideOptions: string = await Select.prompt({
            message: 'Sub-options',
            search: true,
            options: [
                { name: 'Language', value: 'language' },
                { name: 'Reset', value: 'reset'}
            ],
        })

        if (insideOptions == 'language') {
            const language: string = await Select.prompt({
                message: "Choose any language",
                search: true,
                options: [
                  { name: "English", value: "en" },
                  { name: "French", value: "fr" },
                ],
            }) 
    
            if (language == 'en') {
                await jsonWrite({ "language": "en" }, `${gameHome}` + 'JSONs/options.json')
                await animateText('The game is now in english')
                await sleep(1000)
                console.clear()
                mainMenu()
            }
    
            if (language == 'fr') {
                await jsonWrite({ "language": "fr" }, `${gameHome}` + 'JSONs/options.json')
                await animateText('Le jeu est maintenant en français')
                await sleep(1000)
                console.clear()
                mainMenu()
            }
        }
        
        if (insideOptions == 'reset') {
            jsonWrite({ alreadyLaunched: false, textIndex: 0 }, `${gameHome}` + 'JSONs/options.json')
            jsonWrite({
                hp: 10,
                speed: 1,
                strengh: 200,
                xp: 0
            }, `${gameHome}` + 'JSONs/heroes.json')
        }
    }

    if (menu == 'quit game') {
        Deno.exit()
    }
}





async function fighting() {
    inBattle = true
    console.clear()

    await animateText(`Oh no, you just encountered a wild ${randomEnnemy.name}! \n`)
    await sleep(1000)
    await animateText('Let the fight begin in')
    await animateText('3... \n')
    await sleep(1000)
    await animateText('2... \n')
    await sleep(1000)
    await animateText('1... \n')
    await sleep(1000)
    await animateText('FIGHT! \n')

    fightState = true

    let isPlayerTurn = heroes.speed >= randomEnnemy.speed

    async function startTurn() {
        if (isPlayerTurn) {
            const smashOrPass: string = await Select.prompt({
                message: "Would you like to attack or skip your turn?",
                options: [
                    { name: "Smash", value: "smash" },
                    { name: "Pass", value: "pass" },
                ],
            })
            if (smashOrPass == 'smash') {
                console.clear()
                randomEnnemy.hp -= heroes.strengh
                if (randomEnnemy.hp <= 0) {
                    await animateText('You killed it, how cool is that! \n')
                } else {
                    console.log(`${randomEnnemy.name} has now ${randomEnnemy.hp}hp!`)
                }
                endTurn()
            } else {
                endTurn()
            }
        } else {
            console.clear()
            heroes.hp -= randomEnnemy.strengh
            console.log(`${randomEnnemy.name} hit you! You're now at ${heroes.hp}hp.`)
            endTurn()
        }

        if (heroes.hp <= 0){
            await animateText('Oh no, you died! \n')
            await sleep(1250)
            await animateText('Too bad you were too bad to win ¯\\_(ツ)_/¯')
            fightState = false
            Deno.exit
        } else if (randomEnnemy.hp <= 0) {
            fightState = false
            await addXp()
            inBattle = false
        }
    }
      
    function endTurn() {
        isPlayerTurn = !isPlayerTurn
    }
    
    async function nextTurn() {
        while (fightState) {
            await startTurn();
        }
    }
    
    await nextTurn()
}


async function firstLaunch() {
    const firstLaunch = JSON.parse(await Deno.readTextFile(`${gameHome}` + 'JSONs/options.json'))
    if (firstLaunch.alreadyLaunched === false) {
        await animateText(`It looks like it's the first time you launch the game, welcome! \n`)
        await sleep(1000)
        console.clear()
        const language: string = await Select.prompt({
            message: "First, choose your language",
            search: true,
            options: [
                { name: "English", value: "en" },
                { name: "French", value: "fr" },
            ],
        }); 

        if (language == 'en') {
            await jsonWrite({ "language": "en", "alreadyLaunched": true }, `${gameHome}` + 'JSONs/options.json')
            await animateText('The game is now in english')
            await sleep(1000)
            console.clear()
            mainMenu()
        }

        if (language == 'fr') {
            await jsonWrite({ "language": "fr", "alreadyLaunched": true }, `${gameHome}` + 'JSONs/options.json')
            await animateText('Le jeu est maintenant en français')
            await sleep(1000)
            console.clear()
            mainMenu()
        }
        firstLaunch.alreadyLaunched = true
        await jsonWrite({ alreadyLaunched: true, textIndex: 0 }, `${gameHome}` + 'JSONs/options.json')
    } else {
        await mainMenu()
    }
}







await firstLaunch()