const fs = require('fs');
const readline = require('readline');
let rl;

const utils = {
    isEven: (x) => (x % 2 === 0),
    sleep: (x) => new Promise((resolve, reject) => setTimeout(()=>resolve(x), x)),
    chanceToRun: (x) => { 
        const normalize = (a) => {
            let tmp = a.toString();
            while (tmp.length > 1) {
                tmp = tmp.split('').map(y=>parseInt(y,10)).reduce((b,c)=>b+c).toString();
            }
            return parseInt(tmp,10);
        };
        return ((100 - ((normalize(x) + 4) * 10)) / 100);
    },
    glitch: (x) => {
        let bin = x.toString(2).split(x);
        let alreadyGlitched = false;
        return parseInt(bin.map(y => {
            if (alreadyGlitched) return y;
            if (Math.random() > 0.8) return y == '0' ? '1' : '0';
        }).join(''),2);
    },
    input: async () => {
        return new Promise ((resolve, reject) => rl.question('', data => resolve(data)));
    },
    printSquare: () => {
        return console.log( '╔════╗\n'+ '║    ║\n'+ '╚════╝\n' );
    },
    askGentlemansAgreement: () => {
        return new Promise((resolve, reject) => {
            rl.question('Do you agree?\n', data => resolve(data))
        });
    }
}

class Token {
    constructor (instruction) {
        this.name = instruction;
        this.code = Token.LOOKUP_CODE_TABLE[instruction] || Token.LOOKUP_CODE_TABLE['unknown'];
    }
    static LOOKUP_CODE_TABLE = {
        '': '000',
        'unknown': '0000',
        'comment': '0001',
        'look-around': '0002',
        'runback': '0003',
        'goto': '0004',
        'forward': '0005',
        'maybe': '0006',
        'push': '0007',
        'sum': '0008',
        'sub': '0009',
        'close': '0010',
        'bury': '0011',
        'keep': '0012',
        'glitch': '0013',
        'dig': '0014',
        'Lamark': '0015',
        'if-even': '0016',
        'if-gold': '0017',
        'essential': '0018',
        'certainly:': '0019',
        'duplicate': '0020',
        '--': '0021',
        '+++': '0022',
        '[R<>RR]': '0023',
        '[RR<>RRR]': '0024',
        '[R<>RRR]': '0025',
        '[R<>S]': '0026',
        '!do': '0027',
        'pad': '0028',
        'unpad': '0029',
        'printc': '0030',
        'print': '0031',
        'wait': '0032',
        'repeat': '0033',
        'if-nzero': '0034',
        'debug': '0035'
    }
}

class UCHSHOPPLWANPAATILIAVirtualMachine {
    constructor () {
        this.pc = 0;
        this.hole = [];
        this.stack = [];
        this.isHoleOpen = false;
        this.R = 194;
        this.RR = 194;
        this.RRR = 194;
        this.honor = 0;
        this.evolveInterval = 80;
        this.evolutionTimer = null;
        this.silentAgreement = false;
        this.rom = [];
    }

    tokenize = data => {
        return (data
            .replaceAll(/\n/g, 'pppppppppppppp')
            .replace(/\s+/gim, ' ')
            .replaceAll(/pppppppppppppp/g, '\n')
            .split('\n')
            .map(x => new Token(x.trim().split(' ')[0]))
        );
    }

    evolveStack () { this.stack = this.stack.map(x => x+1); }

    startEvolutionTimer () {
        this.evolutionTimer = setInterval(() => {
            this.evolveStack();
        }, this.evolveInterval);
    }

    stopEvolutionTimer () {
        clearInterval(this.evolutionTimer);
    }

    restartEvolutionTimer () {
        this.stopEvolutionTimer();
        this.startEvolutionTimer();
    }

    endWithError (msg) {
        this.pc = -1;
        rl.close();
        this.stopEvolutionTimer();
        console.log(msg);
        throw new Error('-1');
    }

    async input () {
        let inputted = await utils.input();
        try {
            return inputted = (inputted || ' ').charCodeAt(0);
        } catch (err) {
            return null;
        }
    }

    async evaluate () {
        this.startEvolutionTimer();
        if (!this.silentAgreement) {
            let yes = await utils.askGentlemansAgreement();
            if (['y','yes'].includes(yes.toLowerCase())) {
                this.honor = 100;
            } else {
                this.endWithError(`Error: You cant continue if you are not a Gentleman # at line (${this.pc})`);
                return;
            }
        } else {
            this.honor = 100;
        }

        for (this.pc = 0; this.pc < this.rom.length && this.pc >= 0; this.pc++) {
            let token = this.rom[this.pc];
            let next = this.rom[this.pc + 1];
            let last = this.rom[this.pc - 1];
            let tmp;
            
            if (this.R === 666 && this.stack.pop() === 666) {
                this.honor = 79;
            }

            if (this.honor == 0 && !this.silentAgreement) {
                let yes = await utils.askGentlemansAgreement();
                if (['y','yes'].includes(yes.toLowerCase())) {
                    this.honor == 100;
                } else {
                    this.endWithError(`Error:Honor reduced to zero and Gentleman's Agreement denied. You cant continue if you are not a Gentleman # at line (${this.pc})`);
                    continue;
                }
            } else if (this.honor == 0) {
                this.endWithError(`Error:Honor reduced to zero and Gentleman's Agreement ignored by --silent-agreement flag. You cant continue if you are not a Gentleman # at line (${this.pc})`);
                continue;
            }

            this.honor--;
            
            switch (token.code) {
                case '000': // blank line
                    if (this.honor <= 10) this.honor += 2;
                    if (this.honor > 10) this.honor--;
                    break; 

                case '0000': // unknown
                    this.endWithError(`Error: Command not recognized [${token.name}] # at line (${this.pc})`);
                    break;
                
                case '0001': // comment
                    this.honor -= 1;
                    break;

                case '0002': // look-around
                    if (!this.isHoleOpen) this.endWithError(`Error: Hole is not open # at line (${this.pc})`);
                    else this.pc++;
                    break;

                case '0003': // runback
                    if (this.isHoleOpen) this.endWithError(`Fatal: Hole is open, you fell on it and died # at line (${this.pc})`);
                    else {
                        if (utils.isEven(this.pc)) this.pc -= 8;
                        else this.pc -= 9;
                    }
                    break;

                case '0004': // goto
                    if (utils.isEven(this.rom.length)) this.endWithError(`Error: Tried to access the middle of an even-sized program # at line (${this.pc})`);
                    else if (this.isHoleOpen) this.endWithError(`Fatal: Hole is open, you fell on it and died # at line (${this.pc})`);
                    else this.pc = this.rom.length / 2;
                    break;
                    
                case '0005': // forward
                    if (this.isHoleOpen) this.endWithError(`Fatal: Hole is open, you fell on it and died # at line (${this.pc})`);
                    else {
                        if (utils.isEven(this.pc)) this.pc -= 8;
                        else this.pc -= 9;
                    }
                    break;

                case '0006': // maybe
                    tmp = utils.chanceToRun(this.rom.length);
                    if (Math.random() > tmp) this.pc++;
                    break; 

                case '0007': // push
                    this.stack.push(this.R);
                    this.stack.push(0);
                    break;

                case '0008': // sum
                    this.R = this.stack.pop() + this.stack.pop();
                    break;

                case '0009': // sub
                    this.R = this.stack.pop() - this.stack.pop();
                    break;

                case '0010': // close
                    this.isHoleOpen = false;
                    this.hole = [];
                    break;

                case '0011': // bury
                    if (!this.isHoleOpen) this.endWithError(`Fatal: Hole is closed, you cannot place items in a closed hole # at line (${this.pc})`);
                    else {
                        tmp = await this.input();
                        if (tmp == null) this.endWithError(`Fatal: Error while getting input from user # at line (${this.pc})`);
                        this.hole = [ 
                            utils.last(this.stack),
                            this.R,
                            tmp
                        ].sort((a,b)=>a-b);
                    }
                    break;

                case '0012': // keep
                    if (this.R !== 2 && this.R !== 4 && this.R !== 6) {
                        this.endWithError(`Fatal: Invalid hole index, only 2, 4 and 6 allowed, found ${this.R} # at line (${this.pc})`);
                    } else {
                        this.R = this.hole[this.R/2];
                    }
                    break;

                case '0013': // glitch
                    this.R = utils.glitch(this.R);
                    break;

                case '0014': // dig
                    if (this.isHoleOpen) this.endWithError(`Fatal: Hole is already open, cannot dig it again # at line (${this.pc})`);
                    else {
                        this.hole = [];
                        this.isHoleOpen = true;
                    }
                    break;

                case '0015': // Lamark
                    this.restartEvolutionTimer();
                    break;

                case '0016': // if-even
                    if (!utils.isEven(this.R)) this.pc += 5;
                    break;

                case '0017': // if-gold
                    if (this.R !== 97 && this.R !== 79 && this.R !== 19) this.pc += 20;
                    break;

                case '0020': // duplicate
                    this.rom.splice(this.pc, 2, next, last, next, last);
                    break;

                case '0021': // --
                    this.R -= 2;
                    break;

                case '0022': // +++
                    this.R += 3;
                    break;

                case '0023': // [R<>RR]
                    tmp = this.RR;
                    this.RR = this.R;
                    this.R = tmp;
                    break;

                case '0024': // [RR<>RRR]
                    tmp = this.RRR;
                    this.RRR = this.RR;
                    this.RR = tmp;
                    break;

                case '0025': // [R<>RRR]
                    tmp = this.RRR;
                    this.RRR = this.R;
                    this.R = tmp;
                    break;

                case '0026': // [R<>S]
                    tmp = this.stack.pop();
                    this.stack.push(this.R);
                    this.R = tmp;
                    break;

                case '0027': // !do
                    // Do nothing
                    break;

                case '0028': // pad
                    while (this.R < 0) { this.R++; }
                    break;

                case '0029': // unpad
                    while (this.R > 0) { this.R--; }
                    break;

                case '0030': // printc
                    utils.printSquare();
                    console.log(this.honor);
                    break;

                case '0031': // print
                    console.log(String.fromCharCode(this.R) || '?');
                    break;

                case '0032': // wait
                    utils.sleep(this.R);
                    break;

                case '0033': // repeat
                    this.rom.splice(this.pc, 1, ...new Array(Math.abs(this.R)).fill(next));
                    break;
                    
                case '0034': // if-nzero
                    if (this.R == 0) this.pc += 3;
                    break;
            
                case '0035': // debug
                    console.log(
                        ` PC:        ${this.pc}\n` +
                        ` R:         ${this.R}\n` +
                        ` RR:        ${this.RR}\n` +
                        ` RRR:       ${this.RRR}\n` +
                        ` Honor:     ${this.honor}\n` +
                        ` Stack:     | ${this.stack.join(' ')} | <-TOP->\n` +
                        ` Hole:      | ${this.hole.join(' ')} | <2-4-6>\n` +
                        ` Hole Open: ${this.isHoleOpen}\n`
                    );
                    break;
            }
        }

        this.stopEvolutionTimer();
    }

    async run (filename, [flags]) {
        let data;
        try {
            data = fs.readFileSync(filename, 'utf8');
        } catch (err) {
            return console.log('Error: Could not read file # ' + filename);
        }

        let code = this.tokenize(data);
        try {
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            if (flags.includes('--silent-agreement')) {
                this.silentAgreement = true;
            }
            this.rom = code;
            await this.evaluate();
        } catch (err) {
            if (err.message == '-1') process.exit();
            console.log(err)
            console.log('Error: Uncaught exception in code execution # '+err.message);
            process.exit();
        } finally {
            rl.close();
        }
    }
}

module.exports = UCHSHOPPLWANPAATILIAVirtualMachine;