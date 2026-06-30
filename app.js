/**
 * MathQuest: Dungeon Scholar - Main JavaScript Controller
 * Year 7 Algebra Focus
 */

// Sound Synthesizer via Web Audio API
const SoundFX = {
  ctx: null,
  bgmInterval: null,
  bgmNodes: [],
  bgmMuted: true, // Default to muted to comply with browser autoplay

  init() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  startBGM() {
    this.init();
    if (!this.ctx || this.bgmInterval) return;

    // A-minor progression: A2, C3, E3, G3
    const notes = [110.00, 130.81, 164.81, 196.00]; // A2, C3, E3, G3
    let noteIdx = 0;
    
    // Play a note every 0.8 seconds (75 BPM)
    this.bgmInterval = setInterval(() => {
      if (this.bgmMuted) return;
      if (this.ctx.state === 'suspended') return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIdx], now);
      
      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1); // soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // long decay
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 1.5);
      
      this.bgmNodes.push({ osc, gainNode });
      if (this.bgmNodes.length > 10) {
        this.bgmNodes.shift();
      }
      
      noteIdx = (noteIdx + 1) % notes.length;
    }, 800);
  },

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmNodes.forEach(node => {
      try {
        node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, this.ctx.currentTime);
        node.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        setTimeout(() => node.osc.stop(), 250);
      } catch(e) {}
    });
    this.bgmNodes = [];
  },

  toggleBGM() {
    this.bgmMuted = !this.bgmMuted;
    
    if (!this.bgmInterval && !this.bgmMuted) {
      this.startBGM();
    }
    
    const btnText = this.bgmMuted ? "🎵 Unmute BGM" : "🔇 Mute BGM";
    document.querySelectorAll('.bgm-toggle').forEach(btn => {
      btn.innerText = btnText;
      if (this.bgmMuted) {
        btn.classList.remove('active');
      } else {
        btn.classList.add('active');
      }
    });

    if (!this.bgmMuted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(type) {
    this.init();
    if (!this.ctx) return;
    
    // Resume context if suspended (common in mobile browsers)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      switch (type) {
        case 'correct': {
          // A pleasant double chime (ding-ding) - perfect fifth
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(523.25, now); // C5
          osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
          
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc1.start(now);
          osc2.start(now + 0.08);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          break;
        }
        case 'incorrect': {
          // A sad buzzer sound
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now); // A3
          osc.frequency.linearRampToValueAtTime(110, now + 0.45); // Drop to A2
          
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }
        case 'fireball': {
          // Noise sweep mimicking a fire spell blast
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
          
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'lightning': {
          // Fast crackling buzzes
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1200, now + 0.05);
          osc.frequency.setValueAtTime(300, now + 0.1);
          osc.frequency.linearRampToValueAtTime(40, now + 0.3);
          
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.setValueAtTime(0.05, now + 0.05);
          gainNode.gain.setValueAtTime(0.18, now + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
        case 'shield': {
          // Rising synth sweep
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.4);
          
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
        case 'heal': {
          // Arpeggiated chime
          const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            
            gainNode.gain.setValueAtTime(0.1, now + idx * 0.06);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.25);
          });
          break;
        }
        case 'damage': {
          // Short grunt / impact sound
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.2);
          
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'victory': {
          // Fanfare chord progression
          const rootNotes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
          rootNotes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            gainNode.gain.setValueAtTime(0.15, now + idx * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.5);
          });
          break;
        }
        case 'defeat': {
          // Descending sad melody
          const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            
            gainNode.gain.setValueAtTime(0.12, now + idx * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.3);
          });
          break;
        }
      }
    } catch (e) {
      console.warn("Audio failure: Context might not be allowed yet.", e);
    }
  }
};

// Math Engine - Custom Algebra Question Generator for Year 7
const MathEngine = {
  generate(floor) {
    switch (floor) {
      case 1: return this.floor1();
      case 2: return this.floor2();
      case 3: return this.floor3();
      case 4: return this.floor4();
      case 5: return this.floor5();
      case 6: return this.floor6();
      case 7: return this.floor7();
      case 8: return this.floor8();
      case 9: return this.floor9();
      case 10: return this.floor10();
      case 11: return this.floor11();
      case 12: return this.floor12();
      case 13: return this.floor13();
      case 14: return this.floor14();
      case 15: return this.floor15();
      case 16: return this.floor16();
      case 17: return this.floor17();
      case 18: return this.floor18();
      case 19: return this.floor19();
      case 20: return this.floor20();
      default: return this.floor1();
    }
  },

  // Helper to shuffle options array
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Floor 1: Single-Step Equations
  floor1() {
    const types = ['add', 'sub', 'mul', 'div'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];

    if (type === 'add') {
      // x + a = b
      const a = Math.floor(Math.random() * 8) + 2; // 2..9
      const x = Math.floor(Math.random() * 9) + 2; // 2..10
      const b = x + a;
      expression = `x + ${a} = ${b}`;
      correct = x;
      
      // Common mistakes: adding a to b, or just subtracting wrong
      wrongOptions = [
        b + a,        // Add instead of subtract
        b,            // Neglect constant
        Math.abs(b - a - 2) === x ? b - a + 2 : b - a - 2
      ];
    } else if (type === 'sub') {
      // x - a = b
      const a = Math.floor(Math.random() * 8) + 2; // 2..9
      const x = Math.floor(Math.random() * 9) + 5; // 5..13
      const b = x - a;
      expression = `x - ${a} = ${b}`;
      correct = x;

      // Common mistakes: subtracting a from b
      wrongOptions = [
        Math.abs(b - a), // Subtract instead of add
        b,               // Neglect constant
        b + a + Math.floor(Math.random() * 3) + 1
      ];
    } else if (type === 'mul') {
      // ax = b
      const a = Math.floor(Math.random() * 4) + 2; // 2..5
      const x = Math.floor(Math.random() * 7) + 2; // 2..8
      const b = a * x;
      expression = `${a}x = ${b}`;
      correct = x;

      // Common mistakes: subtracting a from b, multiplying them
      wrongOptions = [
        b - a, // Subtract instead of divide
        b * a, // Multiply instead of divide
        x + Math.floor(Math.random() * 2) + 1
      ];
    } else {
      // x / a = b
      const a = Math.floor(Math.random() * 3) + 2; // 2..4
      const x = Math.floor(Math.random() * 5) + 2; // 2..6
      const b = x;
      const displayX = b * a;
      expression = `\\frac{x}{${a}} = ${b}`; // Will format cleanly as x / a
      correct = displayX;

      // Common mistakes: dividing instead of multiplying
      wrongOptions = [
        b,
        Math.ceil(b / a),
        correct - a
      ];
    }

    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 2: Combining Like Terms (Simplifying expressions)
  floor2() {
    const types = ['single', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = "";
    let wrongOptions = [];

    if (type === 'single') {
      // mx + n + px - q
      const m = Math.floor(Math.random() * 5) + 2; // 2..6
      const n = Math.floor(Math.random() * 7) + 2; // 2..8
      const p = Math.floor(Math.random() * 4) + 1; // 1..4
      const q = Math.floor(Math.random() * 5) + 1; // 1..5

      expression = `${m}x + ${n} + ${p}x - ${q}`;
      const coeff = m + p;
      const constant = n - q;
      const sign = constant >= 0 ? '+' : '-';
      const absConst = Math.abs(constant);
      correct = `${coeff}x ${sign} ${absConst}`;

      // Distractors: combining unlike terms (extremely common Year 7 mistake, e.g. 5x + 3 = 8x)
      wrongOptions = [
        `${coeff + absConst}x`, // e.g. 5x + 3 -> 8x
        `${m + p - q}x + ${n}`, 
        `${Math.abs(m - p)}x + ${n + q}`
      ];
    } else {
      // ma + nb - pa + qb
      const m = Math.floor(Math.random() * 5) + 4; // 4..8
      const n = Math.floor(Math.random() * 4) + 2; // 2..5
      const p = Math.floor(Math.random() * 3) + 1; // 1..3
      const q = Math.floor(Math.random() * 3) + 1; // 1..3

      expression = `${m}a + ${n}b - ${p}a + ${q}b`;
      const coeffA = m - p;
      const coeffB = n + q;
      correct = `${coeffA}a + ${coeffB}b`;

      wrongOptions = [
        `${m + p}a + ${Math.abs(n - q)}b`, // Wrong signs
        `${coeffA + coeffB}ab`,           // Combines variables into 'ab' (very common Year 7 error!)
        `${m - p + n + q}a`               // Mixes a and b
      ];
    }

    return this.assembleQuestion("Simplify the expression:", expression, correct, wrongOptions, true);
  },

  // Floor 3: Evaluating Expressions (Substitution)
  floor3() {
    const types = ['basic', 'bracket'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];
    
    if (type === 'basic') {
      // ax + b when x = c
      const a = Math.floor(Math.random() * 4) + 2; // 2..5
      const b = Math.floor(Math.random() * 8) + 1; // 1..8
      const c = Math.floor(Math.random() * 4) + 2; // 2..5
      
      const op = Math.random() > 0.5 ? '+' : '-';
      expression = `Evaluate ${a}x ${op} ${b} when x = ${c}`;
      correct = op === '+' ? (a * c) + b : (a * c) - b;

      // Distractors: place value confusion, e.g. 3x when x=4 is 34
      const concatenated = parseInt(`${a}${c}`); // e.g. 34
      const concatCorrect = op === '+' ? concatenated + b : concatenated - b;

      wrongOptions = [
        concatCorrect, // Place value error: 3x when x=4 becomes 34
        correct + a,   // Math operation error
        correct - b    // Math operation error
      ];
    } else {
      // a(x + b) when x = c
      const a = Math.floor(Math.random() * 3) + 2; // 2..4
      const b = Math.floor(Math.random() * 4) + 1; // 1..4
      const c = Math.floor(Math.random() * 4) + 2; // 2..5

      expression = `Evaluate ${a}(x + ${b}) when x = ${c}`;
      correct = a * (c + b);

      // Distractors: neglecting brackets: a*x + b
      const neglectBrackets = (a * c) + b;
      wrongOptions = [
        neglectBrackets, // Neglected parentheses
        correct - b,
        correct + a
      ];
    }

    return this.assembleQuestion("Calculate the value:", expression, correct, wrongOptions);
  },

  // Floor 4: Two-Step Equations
  floor4() {
    const types = ['add', 'sub', 'div'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];

    if (type === 'add') {
      // ax + b = c
      const a = Math.floor(Math.random() * 3) + 2; // 2..4
      const x = Math.floor(Math.random() * 7) + 2; // 2..8
      const b = Math.floor(Math.random() * 8) + 2; // 2..9
      const c = (a * x) + b;

      expression = `${a}x + ${b} = ${c}`;
      correct = x;

      // Distractors: adding b instead of subtracting, forgetting to divide
      const addInstead = Math.round((c + b) / a);
      const noDivide = c - b;

      wrongOptions = [
        addInstead, // Added instead of subtracted
        noDivide,   // Forgot to divide
        correct + Math.floor(Math.random() * 3) + 1
      ];
    } else if (type === 'sub') {
      // ax - b = c
      const a = Math.floor(Math.random() * 3) + 2; // 2..4
      const x = Math.floor(Math.random() * 7) + 2; // 2..8
      const b = Math.floor(Math.random() * 8) + 2; // 2..9
      const c = (a * x) - b;

      expression = `${a}x - ${b} = ${c}`;
      correct = x;

      // Distractors: subtracting b instead of adding, forgetting to divide
      const subInstead = Math.round((c - b) / a);
      const noDivide = c + b;

      wrongOptions = [
        subInstead, // Subtracted instead of added
        noDivide,   // Forgot to divide
        correct + 3
      ];
    } else {
      // x / a + b = c
      const a = Math.floor(Math.random() * 2) + 2; // 2..3
      const x = Math.floor(Math.random() * 6) + 2; // 2..7
      const b = Math.floor(Math.random() * 5) + 1; // 1..5
      const c = x + b;
      const displayX = x * a;

      expression = `\\frac{x}{${a}} + ${b} = ${c}`;
      correct = displayX;

      // Distractors: subtracting instead of multiplying
      wrongOptions = [
        c - b,                // Just constant operation
        (c + b) * a,          // Sign error then multiply
        Math.round(displayX / a) // Divided instead of multiplied
      ];
    }

    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 5: Distributive Property & Variables on Both Sides
  floor5() {
    const types = ['dist', 'both'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];

    if (type === 'dist') {
      // a(x + b) = c
      const a = Math.floor(Math.random() * 3) + 2; // 2..4
      const x = Math.floor(Math.random() * 6) + 2; // 2..7
      const b = Math.floor(Math.random() * 4) + 1; // 1..4
      const c = a * (x + b);

      expression = `${a}(x + ${b}) = ${c}`;
      correct = x;

      // Distractor: only distributing to first term: ax + b = c => x = (c - b)/a
      const partialDistribute = Math.round((c - b) / a);
      const addInstead = x + (b * 2);

      wrongOptions = [
        partialDistribute, // Forgot to multiply constant by a
        addInstead,
        correct + 2
      ];
    } else {
      // ax = cx + d => (a-c)x = d
      // Ensure (a - c) > 0 and d is a multiple of (a-c)
      const diff = Math.floor(Math.random() * 3) + 2; // coefficient difference 2..4
      const c = Math.floor(Math.random() * 3) + 2; // cx coefficient 2..4
      const a = c + diff;
      const x = Math.floor(Math.random() * 5) + 2; // answer 2..6
      const d = diff * x;

      expression = `${a}x = ${c}x + ${d}`;
      correct = x;

      // Distractors: adding coefficients: (a+c)x = d
      const addCoeffs = Math.round(d / (a + c));
      const neglectVariables = d;

      wrongOptions = [
        addCoeffs, // Added coefficients instead of subtracting
        neglectVariables,
        correct + 3
      ];
    }

    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 6: Single-step equations with negative numbers
  floor6() {
    const types = ['add', 'sub', 'mul'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];
    
    if (type === 'add') {
      const a = Math.floor(Math.random() * 12) + 2; 
      const x = -(Math.floor(Math.random() * 8) + 2); 
      const b = x + a; 
      expression = `x + ${a} = ${b}`;
      correct = x;
      wrongOptions = [x - a, b + a, -x];
    } else if (type === 'sub') {
      const a = Math.floor(Math.random() * 12) + 2;
      const x = -(Math.floor(Math.random() * 6) + 1); 
      const b = x - a;
      expression = `x - ${a} = ${b}`;
      correct = x;
      wrongOptions = [b - a, a - b, -x];
    } else {
      const a = -(Math.floor(Math.random() * 4) + 2); 
      const x = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 2); 
      const b = a * x;
      expression = `${a}x = ${b}`;
      correct = x;
      wrongOptions = [b - a, Math.round(b / (-a)), -x];
    }
    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 7: Equations involving basic fractions
  floor7() {
    const types = ['basic', 'coefficient'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];
    
    if (type === 'basic') {
      const a = Math.floor(Math.random() * 2) + 3; 
      const x = Math.floor(Math.random() * 5) + 2; 
      const b = Math.floor(Math.random() * 6) + 1; 
      const c = x + b;
      const displayX = x * a;
      
      expression = `\\frac{x}{${a}} - ${b} = ${c - 2*b}`; 
      correct = displayX;
      wrongOptions = [x, (c - b) * a, displayX - a];
    } else {
      const multiplier = Math.floor(Math.random() * 3) + 1; 
      const valX = multiplier * 3; 
      const valB = (2 * valX) / 3; 
      expression = `\\frac{2x}{3} = ${valB}`;
      correct = valX;
      wrongOptions = [valB * 3, Math.round((valB * 3)/4), valX + 3];
    }
    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 8: Complex expressions with negative terms
  floor8() {
    const types = ['single', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = "";
    let wrongOptions = [];
    
    if (type === 'single') {
      const m = Math.floor(Math.random() * 4) + 2; 
      const n = Math.floor(Math.random() * 6) + 2; 
      const p = Math.floor(Math.random() * 4) + 2; 
      const q = Math.floor(Math.random() * 6) + n + 1; 
      
      expression = `-${m}x + ${n} - ${p}x - ${q}`;
      const coeff = -m - p;
      const constant = n - q;
      correct = `${coeff}x - ${Math.abs(constant)}`;
      
      wrongOptions = [
        `${-m + p}x - ${n + q}`,
        `${coeff + constant}x`, 
        `${Math.abs(coeff)}x + ${Math.abs(constant)}`
      ];
    } else {
      const m = Math.floor(Math.random() * 5) + 3; 
      const n = Math.floor(Math.random() * 4) + 2; 
      const p = Math.floor(Math.random() * 3) + 1; 
      const q = Math.floor(Math.random() * 3) + 2; 
      
      expression = `-${m}a - ${n}b + ${p}a - ${q}b`;
      const coeffA = -m + p; 
      const coeffB = -n - q; 
      correct = `${coeffA}a - ${Math.abs(coeffB)}b`;
      
      wrongOptions = [
        `${-m - p}a + ${n - q}b`,
        `${coeffA - coeffB}ab`,
        `${coeffA + coeffB}a`
      ];
    }
    return this.assembleQuestion("Simplify the expression:", expression, correct, wrongOptions, true);
  },

  // Floor 9: Negative distributive property
  floor9() {
    const a = -(Math.floor(Math.random() * 3) + 2); 
    const x = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 2); 
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1); 
    const c = a * (x + b);
    
    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    expression = `${a}(x ${bSign}) = ${c}`;
    correct = x;
    
    const partialDist = Math.round((c - b) / a);
    const signError = -x;
    
    wrongOptions = [
      partialDist,
      signError,
      correct + 3
    ];
    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 10: Sovereign's Lair (Boss Equations)
  floor10() {
    const types = ['both_neg', 'dist_both'];
    const type = types[Math.floor(Math.random() * types.length)];
    let expression = "";
    let correct = 0;
    let wrongOptions = [];
    
    if (type === 'both_neg') {
      const diff = Math.floor(Math.random() * 3) + 2; 
      const c = Math.floor(Math.random() * 4) + 2; 
      const a = c + diff;
      const x = -(Math.floor(Math.random() * 6) + 2); 
      const b = Math.floor(Math.random() * 8) + 1; 
      const d = (diff * x) + b;
      
      const dSign = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
      expression = `${a}x + ${b} = ${c}x ${dSign}`;
      correct = x;
      
      wrongOptions = [
        Math.round((d + b) / (a + c)),
        -x,
        correct - 3
      ];
    } else {
      const diff = Math.floor(Math.random() * 2) + 2; 
      const c = Math.floor(Math.random() * 3) + 1; 
      const a = c + diff;
      const x = -(Math.floor(Math.random() * 5) + 2); 
      const b = Math.floor(Math.random() * 3) + 2; 
      const d = (diff * x) - (a * b);
      
      const dSign = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
      expression = `${a}(x - ${b}) = ${c}x ${dSign}`;
      correct = x;
      
      wrongOptions = [
        Math.round((d - a * b) / (a - c)), 
        -x,
        correct + 2
      ];
    }
    return this.assembleQuestion("Solve for x:", expression, correct, wrongOptions);
  },

  // Floor 11: Linear Inequalities
  floor11() {
    const type = Math.random() > 0.5 ? 'pos' : 'neg';
    let expression = "";
    let correct = "";
    let wrongOptions = [];
    
    if (type === 'pos') {
      const a = Math.floor(Math.random() * 4) + 2; 
      const b = Math.floor(Math.random() * 6) + 1; 
      const ans = Math.floor(Math.random() * 5) + 2; 
      const c = a * ans + b;
      expression = `${a}x + ${b} > ${c}`;
      correct = `x > ${ans}`;
      wrongOptions = [`x < ${ans}`, `x > ${ans + 2}`, `x < ${ans + 2}`];
    } else {
      const a = -(Math.floor(Math.random() * 4) + 2); 
      const b = Math.floor(Math.random() * 6) + 1; 
      const ans = Math.floor(Math.random() * 5) + 2; 
      const c = a * ans + b;
      expression = `${a}x + ${b} > ${c}`;
      correct = `x < ${ans}`; // flipped sign
      wrongOptions = [`x > ${ans}`, `x < ${ans + 2}`, `x > ${ans + 2}`];
    }
    return this.assembleQuestion("Solve inequality:", expression, correct, wrongOptions, true);
  },

  // Floor 12: Expanding Double Brackets
  floor12() {
    const a = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    
    const aStr = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    
    const expression = `(x ${aStr})(x ${bStr})`;
    
    const midCoeff = a + b;
    const constant = a * b;
    
    const midStr = midCoeff === 0 ? '' : midCoeff > 0 ? (midCoeff === 1 ? '+ x ' : `+ ${midCoeff}x `) : (midCoeff === -1 ? '- x ' : `- ${Math.abs(midCoeff)}x `);
    const constStr = constant > 0 ? `+ ${constant}` : (constant < 0 ? `- ${Math.abs(constant)}` : '');
    
    const correct = `x² ${midStr}${constStr}`.trim();
    
    const w1Mid = a - b;
    const w1MidStr = w1Mid === 0 ? '' : w1Mid > 0 ? (w1Mid === 1 ? '+ x ' : `+ ${w1Mid}x `) : (w1Mid === -1 ? '- x ' : `- ${Math.abs(w1Mid)}x `);
    const wrong1 = `x² ${w1MidStr}${constStr}`.trim();
    
    const w2Const = a + b;
    const w2ConstStr = w2Const > 0 ? `+ ${w2Const}` : (w2Const < 0 ? `- ${Math.abs(w2Const)}` : '');
    const wrong2 = `x² ${midStr}${w2ConstStr}`.trim();

    const wrong3 = `x² ${constStr}`.trim();

    return this.assembleQuestion("Expand:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 13: Basic Factorization
  floor13() {
    const a = Math.floor(Math.random() * 5) + 2; 
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1); 
    const ax = a * (Math.floor(Math.random() * 3) + 1); 
    
    const term1 = ax;
    const term2 = a * b;
    
    const t2Str = term2 > 0 ? `+ ${term2}` : `- ${Math.abs(term2)}`;
    const expression = `${term1}x ${t2Str}`;
    
    const xCoeff = term1 / a;
    const constVal = term2 / a;
    const xStr = xCoeff === 1 ? 'x' : `${xCoeff}x`;
    const constStr = constVal > 0 ? `+ ${constVal}` : `- ${Math.abs(constVal)}`;
    
    const correct = `${a}(${xStr} ${constStr})`;
    const wrong1 = `${a}(${xStr} ${constVal > 0 ? `- ${constVal}` : `+ ${Math.abs(constVal)}`})`;
    const wrong2 = `${term1}(x ${t2Str})`;
    const wrong3 = `${a}(${term1}x ${constStr})`;

    return this.assembleQuestion("Factorize:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 14: Variables on Both Sides
  floor14() {
    const diff = Math.floor(Math.random() * 4) + 2; 
    const c = Math.floor(Math.random() * 4) + 2; 
    const a = c + diff;
    const ans = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 2); 
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1); 
    
    const d = (a * ans) + b - (c * ans);
    
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const dStr = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
    
    const expression = `${a}x ${bStr} = ${c}x ${dStr}`;
    const correct = ans;
    
    const wrong1 = -ans;
    const wrong2 = Math.round((d + b) / (a + c));
    const wrong3 = Math.round((d - b) / (a + c));

    return this.assembleQuestion("Solve for x:", expression, correct, [wrong1, wrong2, wrong3]);
  },

  // Floor 15: Simultaneous Equations (Substitution)
  floor15() {
    const a = Math.floor(Math.random() * 3) + 1; 
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1); 
    const c = Math.floor(Math.random() * 3) + 2; 
    const d = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1); 
    
    const x = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1); 
    const y = a * x + b;
    const e = c * x + d * y;
    
    const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const dStr = d > 0 ? `+ ${d}y` : (d === -1 ? `- y` : (d === 1 ? `+ y` : `- ${Math.abs(d)}y`));
    
    const expr1 = `y = ${a === 1 ? 'x' : a + 'x'} ${bStr}`;
    const expr2 = `${c}x ${dStr} = ${e}`;
    
    const expression = `${expr1} & ${expr2}`;
    const correct = `x=${x}, y=${y}`;
    
    const wrong1 = `x=${-x}, y=${-y}`;
    const wrong2 = `x=${y}, y=${x}`;
    const wrong3 = `x=${x + 1}, y=${y - 1}`;
    
    return this.assembleQuestion("Solve systems:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 16: Quadratic Factorization
  floor16() {
    const a = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    
    const midCoeff = a + b;
    const constant = a * b;
    
    const midStr = midCoeff === 0 ? '' : midCoeff > 0 ? (midCoeff === 1 ? '+ x ' : `+ ${midCoeff}x `) : (midCoeff === -1 ? '- x ' : `- ${Math.abs(midCoeff)}x `);
    const constStr = constant > 0 ? `+ ${constant}` : (constant < 0 ? `- ${Math.abs(constant)}` : '');
    
    const expression = `x² ${midStr}${constStr}`.trim();
    
    const aStr = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    
    const correct = `(x ${aStr})(x ${bStr})`;
    
    const w1A = a > 0 ? `- ${a}` : `+ ${Math.abs(a)}`;
    const w1B = b > 0 ? `- ${b}` : `+ ${Math.abs(b)}`;
    const wrong1 = `(x ${w1A})(x ${w1B})`;
    
    const w2A = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const w2B = b > 0 ? `- ${b}` : `+ ${Math.abs(b)}`;
    const wrong2 = `(x ${w2A})(x ${w2B})`;
    
    return this.assembleQuestion("Factorize:", expression, correct, [wrong1, wrong2, `(x ${aStr})²`], true);
  },

  // Floor 17: Solving Quadratics by Factoring
  floor17() {
    const a = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    let b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    if (a === b) b += 1; 
    
    const midCoeff = a + b;
    const constant = a * b;
    
    const midStr = midCoeff === 0 ? '' : midCoeff > 0 ? (midCoeff === 1 ? '+ x ' : `+ ${midCoeff}x `) : (midCoeff === -1 ? '- x ' : `- ${Math.abs(midCoeff)}x `);
    const constStr = constant > 0 ? `+ ${constant}` : (constant < 0 ? `- ${Math.abs(constant)}` : '');
    
    const expression = `x² ${midStr}${constStr} = 0`.trim();
    
    const root1 = -a;
    const root2 = -b;
    const correct = `${Math.min(root1, root2)}, ${Math.max(root1, root2)}`;
    
    const wrong1 = `${Math.min(a, b)}, ${Math.max(a, b)}`;
    const wrong2 = `${root1}, ${b}`;
    const wrong3 = `${a}, ${root2}`;
    
    return this.assembleQuestion("Solve for x:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 18: Simultaneous Equations (Elimination)
  floor18() {
    const b = Math.floor(Math.random() * 3) + 2; 
    const a = Math.floor(Math.random() * 3) + 2; 
    const c = Math.floor(Math.random() * 3) + 1; 
    
    const x = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1); 
    const y = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1); 
    
    const e = a * x + b * y;
    const f = c * x - b * y;
    
    const expr1 = `${a}x + ${b}y = ${e}`;
    const expr2 = `${c === 1 ? '' : c}x - ${b}y = ${f}`;
    
    const expression = `${expr1} & ${expr2}`;
    const correct = `x=${x}, y=${y}`;
    
    const wrong1 = `x=${-x}, y=${y}`;
    const wrong2 = `x=${x}, y=${-y}`;
    const wrong3 = `x=${-x}, y=${-y}`;
    
    return this.assembleQuestion("Solve systems:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 19: Difference of Two Squares
  floor19() {
    const a = Math.floor(Math.random() * 4) + 1; 
    const b = Math.floor(Math.random() * 6) + 1; 
    
    const a2 = a * a;
    const b2 = b * b;
    
    const expression = `${a2 === 1 ? '' : a2}x² - ${b2}`;
    
    const axStr = a === 1 ? 'x' : `${a}x`;
    const correct = `(${axStr} - ${b})(${axStr} + ${b})`;
    
    const wrong1 = `(${axStr} - ${b2})(${axStr} + ${b2})`;
    const wrong2 = `(${axStr} - ${b})²`;
    const wrong3 = `(${a2 === 1 ? '' : a2}x - ${b})(${a2 === 1 ? '' : a2}x + ${b})`;
    
    return this.assembleQuestion("Factorize:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Floor 20: Solving Hard Quadratics
  floor20() {
    const a = Math.floor(Math.random() * 3) + 2; 
    const c = 1;
    const b = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1); 
    const d = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1); 
    
    const coeffA = a * c;
    const coeffB = a * d + b * c;
    const coeffC = b * d;
    
    const midStr = coeffB === 0 ? '' : coeffB > 0 ? (coeffB === 1 ? '+ x ' : `+ ${coeffB}x `) : (coeffB === -1 ? '- x ' : `- ${Math.abs(coeffB)}x `);
    const constStr = coeffC > 0 ? `+ ${coeffC}` : (coeffC < 0 ? `- ${Math.abs(coeffC)}` : '');
    
    const expression = `${coeffA}x² ${midStr}${constStr} = 0`.trim();
    
    const root1 = b > 0 ? `-${b}/${a}` : `${Math.abs(b)}/${a}`;
    const root2 = -d;
    
    let r1Str = root1;
    if (Math.abs(b) % a === 0) {
      r1Str = String(-b / a);
    }
    
    const correct = `${r1Str}, ${root2}`;
    
    const wrong1 = `${b > 0 ? b : Math.abs(b)}/${a}, ${-root2}`;
    const wrong2 = `${root2}, ${r1Str.includes('-') ? r1Str.replace('-', '') : '-' + r1Str}`;
    const wrong3 = `${b}, ${d}`;
    
    return this.assembleQuestion("Solve for x:", expression, correct, [wrong1, wrong2, wrong3], true);
  },

  // Format and package math questions cleanly
  assembleQuestion(instruction, expr, correctVal, wrongVals, isString = false) {
    // Standardize representation of fractional equations for mobile view
    let displayExpr = expr.replace(/\\frac\{x\}\{([0-9]+)\}/g, "x / $1");

    const correctStr = String(correctVal);
    const optionsSet = new Set([correctStr]);

    // Fill wrong answers and make sure they are unique
    wrongVals.forEach(val => {
      const s = String(val);
      if (s !== correctStr && s !== "NaN" && s !== "") {
        optionsSet.add(s);
      }
    });

    // Fallbacks if we don't have enough options
    let attempt = 1;
    while (optionsSet.size < 4 && attempt < 20) {
      if (!isString) {
        const num = Number(correctVal);
        const offset = Math.random() > 0.5 ? attempt : -attempt;
        optionsSet.add(String(num + offset));
      } else {
        // String expression fallback modifiers
        optionsSet.add(`${correctVal} + ${attempt}`);
      }
      attempt++;
    }

    const optionsArray = Array.from(optionsSet);
    this.shuffle(optionsArray);

    const correctIdx = optionsArray.indexOf(correctStr);

    return {
      instruction,
      expression: displayExpr,
      options: optionsArray,
      correctIndex: correctIdx
    };
  }
};

// RPG Enemies Config
const Enemies = [
  { name: "Equation Imp", hp: 40, attack: 10, avatar: "assets/goblin.png", desc: "A cheeky critter that disrupts simple numbers." },
  { name: "Like-Term Slime", hp: 55, attack: 12, avatar: "assets/golem.png", desc: "A gooey mass that sticks coefficients together." },
  { name: "Substitution Specter", hp: 70, attack: 15, avatar: "assets/goblin.png", desc: "A spectral shadow that masks variables as numbers." },
  { name: "Double-Step Golem", hp: 85, attack: 18, avatar: "assets/golem.png", desc: "A heavy beast made of rigid, two-step equations." },
  { name: "Distributive Dragon", hp: 120, attack: 22, avatar: "assets/dragon.png", desc: "The legendary scaling beast of expanding brackets." },
  { name: "Negative Specter", hp: 140, attack: 25, avatar: "assets/goblin.png", desc: "A ghost that mirrors numbers below absolute zero." },
  { name: "Fractional Phoenix", hp: 160, attack: 28, avatar: "assets/dragon.png", desc: "A flaming bird that splits values into portions." },
  { name: "Integer Hydra", hp: 180, attack: 30, avatar: "assets/golem.png", desc: "A stone creature with negative and positive heads." },
  { name: "Brackets Overlord", hp: 200, attack: 35, avatar: "assets/mage.png", desc: "A dark wizard who binds numbers in parentheses." },
  { name: "Alge-Dragon Sovereign", hp: 250, attack: 40, avatar: "assets/dragon.png", desc: "The ultimate ruler of variables and constants." },
  { name: "Inequality Phantom", hp: 280, attack: 45, avatar: "assets/goblin.png", desc: "A spirit that bounds your values." },
  { name: "Bracket Beast", hp: 310, attack: 50, avatar: "assets/golem.png", desc: "A beast of double expansion." },
  { name: "Factor Fiend", hp: 350, attack: 55, avatar: "assets/goblin.png", desc: "Splits expressions into smaller parts." },
  { name: "Dual-Sided Demon", hp: 390, attack: 60, avatar: "assets/dragon.png", desc: "Has variables on both left and right." },
  { name: "Simultaneous Sentinel", hp: 440, attack: 65, avatar: "assets/golem.png", desc: "Guards the mid-level with dual constraints." },
  { name: "Quadratic Behemoth", hp: 480, attack: 70, avatar: "assets/dragon.png", desc: "A massive creature with squared power." },
  { name: "Root Ranger", hp: 520, attack: 75, avatar: "assets/mage.png", desc: "Searches for zeroes on the x-axis." },
  { name: "Eliminator Drone", hp: 560, attack: 80, avatar: "assets/golem.png", desc: "Destroys variables through subtraction." },
  { name: "Two-Squares Terror", hp: 600, attack: 85, avatar: "assets/goblin.png", desc: "Exploits the difference between perfection." },
  { name: "Algebraic God", hp: 700, attack: 100, avatar: "assets/dragon.png", desc: "The supreme master of higher mathematics." }
];

// Game Controller
const Game = {
  // Game state variables
  selectedClass: 'mage',
  unlockedFloor: 1,
  currentFloor: 1,
  gold: 0,
  level: 1,
  
  // Combat states
  playerHP: 100,
  playerMaxHP: 100,
  playerShield: 0,
  enemyHP: 50,
  enemyMaxHP: 50,
  enemyName: "",
  enemyAttack: 10,
  enemyIntent: "attack", // 'attack', 'defend'
  
  // Round trackers
  activeQuestion: null,
  activeSpell: null,
  isProcessingTurn: false,
  questionsAttempted: 0,
  correctAnswers: 0,
  floorGoldEarned: 0,

  // Timer properties
  timerInterval: null,
  timeLeft: 15,
  timerDuration: 15,
  isSpeedBonus: false,
  isSpeedPenalty: false,

  // DOM Elements
  screens: {},
  
  init() {
    this.loadSave();
    this.cacheDOM();
    this.bindEvents();
    this.updateStartScreen();
    SoundFX.init();
  },

  cacheDOM() {
    this.screens.start = document.getElementById('screen-start');
    this.screens.battle = document.getElementById('screen-battle');
    this.screens.gameover = document.getElementById('screen-gameover');
    
    this.characterCards = document.querySelectorAll('.character-card');
    this.floorButtons = document.querySelectorAll('.floor-btn');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnLeaveDungeon = document.getElementById('btn-leave-dungeon');
    
    // Combat UI
    this.playerHPBar = document.getElementById('player-hp-bar');
    this.playerHPText = document.getElementById('player-hp-text');
    this.playerShieldBar = document.getElementById('player-shield-bar');
    this.playerShieldText = document.getElementById('player-shield-text');
    this.playerLevel = document.getElementById('player-level');
    
    this.enemyNameEl = document.getElementById('enemy-name');
    this.enemyHPBar = document.getElementById('enemy-hp-bar');
    this.enemyHPText = document.getElementById('enemy-hp-text');
    this.enemyAvatar = document.getElementById('enemy-avatar');
    this.enemyIntentText = document.getElementById('enemy-intent-text');
    
    this.combatLog = document.getElementById('combat-log');
    this.puzzleInstructions = document.getElementById('puzzle-instructions');
    this.puzzleExpression = document.getElementById('puzzle-expression');
    this.goldValue = document.getElementById('gold-value');
    
    // Spell Deck / MCQ
    this.deckView = document.getElementById('deck-view');
    this.choicesView = document.getElementById('choices-view');
    this.spellCards = document.querySelectorAll('.spell-card');
    this.optionButtons = document.querySelectorAll('.option-btn');
    this.activeSpellName = document.getElementById('active-spell-name');
    
    // GameOver Screen
    this.btnNextFloor = document.getElementById('btn-next-floor');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnReturnHome = document.getElementById('btn-return-home');
  },

  bindEvents() {
    // Character select
    this.characterCards.forEach(card => {
      card.addEventListener('click', () => {
        this.characterCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedClass = card.dataset.class;
      });
    });

    // Floor select
    this.floorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const floorNum = parseInt(btn.dataset.floor);
        if (floorNum <= this.unlockedFloor) {
          this.currentFloor = floorNum;
          this.updateFloorSelectionUI();
        }
      });
    });

    // BGM Mute controls
    document.querySelectorAll('.bgm-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundFX.toggleBGM();
      });
    });

    // Start Game
    this.btnStartGame.addEventListener('click', () => {
      this.startBattle(this.currentFloor);
    });

    // Leave Game
    this.btnLeaveDungeon.addEventListener('click', () => {
      if (confirm("Retreat from the dungeon? All current floor gold will be lost!")) {
        SoundFX.stopBGM();
        this.changeScreen('start');
      }
    });

    // Spells select
    this.spellCards.forEach(card => {
      card.addEventListener('click', () => {
        if (this.isProcessingTurn) return;
        const spell = card.dataset.spell;
        this.selectSpell(spell);
      });
    });

    // MCQ Answers
    this.optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isProcessingTurn) return;
        const idx = parseInt(btn.dataset.index);
        this.submitAnswer(idx);
      });
    });

    // GameOver buttons
    this.btnNextFloor.addEventListener('click', () => {
      this.currentFloor = Math.min(20, this.currentFloor + 1);
      this.startBattle(this.currentFloor);
    });

    this.btnRestart.addEventListener('click', () => {
      this.startBattle(this.currentFloor);
    });

    this.btnReturnHome.addEventListener('click', () => {
      this.changeScreen('start');
    });
  },

  loadSave() {
    const savedFloor = localStorage.getItem('mq_unlockedFloor');
    const savedGold = localStorage.getItem('mq_gold');
    const savedLevel = localStorage.getItem('mq_level');

    if (savedFloor) this.unlockedFloor = parseInt(savedFloor);
    if (savedGold) this.gold = parseInt(savedGold);
    if (savedLevel) this.level = parseInt(savedLevel);
  },

  saveGame() {
    localStorage.setItem('mq_unlockedFloor', this.unlockedFloor);
    localStorage.setItem('mq_gold', this.gold);
    localStorage.setItem('mq_level', this.level);
  },

  changeScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
    
    if (screenName === 'start') {
      this.updateStartScreen();
    }
  },

  updateStartScreen() {
    this.goldValue.innerText = this.gold;
    this.updateFloorSelectionUI();
  },

  updateFloorSelectionUI() {
    this.floorButtons.forEach(btn => {
      const floorNum = parseInt(btn.dataset.floor);
      btn.classList.remove('active', 'locked');
      
      if (floorNum > this.unlockedFloor) {
        btn.classList.add('locked');
      } else {
        if (floorNum === this.currentFloor) {
          btn.classList.add('active');
        }
      }
    });
  },

  startBattle(floor) {
    this.currentFloor = floor;
    
    // Set up Battle indicators
    const floorIndicator = document.querySelector('.floor-indicator');
    const floorNames = [
      "Linear Forest", "Oasis of Like Terms", "Volcano of Substitution", "Grotto of Two-Steps", "Overlord's Lair",
      "Negative Forest", "Fractional Oasis", "Grotto of Negative Terms", "Volcano of Negative Distribution", "Sovereign's Lair",
      "Inequality Plains", "Double Bracket Cave", "Factorization Fort", "Dual-Sided Domain", "Simultaneous Spire",
      "Quadratic Quarry", "Root River", "Elimination Engine", "Two-Squares Temple", "Algebraic Apex"
    ];
    floorIndicator.innerText = `Floor ${floor}: ${floorNames[floor - 1]}`;

    // Reset Combatants based on selected class
    let classNameStr = "Alge-Mage";
    let avatarSrc = "assets/mage.png";
    this.playerHP = 100;
    this.playerMaxHP = 100;
    this.playerShield = 0;

    if (this.selectedClass === 'knight') {
      classNameStr = "Eq. Knight";
      avatarSrc = "assets/knight.png";
      this.playerHP = 120;
      this.playerMaxHP = 120;
      this.playerShield = 30;
    } else if (this.selectedClass === 'rogue') {
      classNameStr = "Var. Rogue";
      avatarSrc = "assets/rogue.png";
      this.playerHP = 85;
      this.playerMaxHP = 85;
    }

    this.playerLevel.innerText = this.level;
    const playerCardName = document.querySelector('#player-card .name');
    if (playerCardName) playerCardName.innerText = classNameStr;
    const playerCardImg = document.querySelector('#player-card img');
    if (playerCardImg) playerCardImg.src = avatarSrc;
    
    const enemyData = Enemies[floor - 1];
    this.enemyName = enemyData.name;
    this.enemyMaxHP = enemyData.hp;
    this.enemyHP = enemyData.hp;
    this.enemyAttack = enemyData.attack;
    this.enemyAvatar.src = enemyData.avatar;
    this.enemyNameEl.innerText = this.enemyName;

    // Reset statistics
    this.questionsAttempted = 0;
    this.correctAnswers = 0;
    this.floorGoldEarned = 0;
    this.isProcessingTurn = false;
    this.isSpeedBonus = false;
    this.isSpeedPenalty = false;
    this.stopTimer();

    this.updateHPBars();
    this.clearCombatLog();
    this.addLogEntry(`You entered Floor ${floor}. A wild ${this.enemyName} blocks your path!`, 'system-alert');
    
    this.updateEnemyIntent();
    this.showDeckView();
    
    // Start continuous music
    SoundFX.startBGM();

    this.changeScreen('battle');
  },

  updateHPBars() {
    // Player
    const playerPct = Math.max(0, (this.playerHP / this.playerMaxHP) * 100);
    this.playerHPBar.style.width = `${playerPct}%`;
    this.playerHPText.innerText = `${this.playerHP}/${this.playerMaxHP}`;
    
    // Shield
    const shieldPct = Math.min(100, (this.playerShield / 30) * 100); // Max visual shield limit 30
    this.playerShieldBar.style.width = `${shieldPct}%`;
    this.playerShieldText.innerText = `${this.playerShield}`;

    // Enemy
    const enemyPct = Math.max(0, (this.enemyHP / this.enemyMaxHP) * 100);
    this.enemyHPBar.style.width = `${enemyPct}%`;
    this.enemyHPText.innerText = `${this.enemyHP}/${this.enemyMaxHP}`;
  },

  updateEnemyIntent() {
    const intents = ['attack', 'defend', 'heavy'];
    // Randomize enemy intent
    const roll = Math.random();
    if (roll < 0.6) {
      this.enemyIntent = 'attack';
      this.enemyIntentText.innerText = `Slam (deals ${this.enemyAttack} DMG)`;
      this.enemyIntentText.className = 'intent-attack';
    } else if (roll < 0.85) {
      this.enemyIntent = 'defend';
      const blockAmt = Math.round(this.enemyAttack * 0.8);
      this.enemyIntentText.innerText = `Shield Up (+${blockAmt} Armor)`;
      this.enemyIntentText.className = 'intent-defend';
    } else {
      this.enemyIntent = 'heavy';
      const heavyAmt = Math.round(this.enemyAttack * 1.5);
      this.enemyIntentText.innerText = `Mega Smash (deals ${heavyAmt} DMG)`;
      this.enemyIntentText.className = 'intent-special';
    }
  },

  showDeckView() {
    this.deckView.classList.add('active');
    this.choicesView.classList.remove('active');
    this.puzzleInstructions.innerText = "Select a spell to charge combat calculations...";
    this.puzzleExpression.innerHTML = `<div class="pulse-indicator">?</div>`;
  },

  selectSpell(spell) {
    this.activeSpell = spell;
    this.activeSpellName.innerText = spell.toUpperCase();

    // Generate puzzle matching floor difficulty
    this.activeQuestion = MathEngine.generate(this.currentFloor);

    // Display puzzle
    this.puzzleInstructions.innerText = this.activeQuestion.instruction;
    this.puzzleExpression.innerText = this.activeQuestion.expression;

    // Set options
    this.optionButtons.forEach((btn, idx) => {
      btn.className = "btn option-btn"; // Reset colors
      btn.innerText = this.activeQuestion.options[idx];
    });

    this.deckView.classList.remove('active');
    this.choicesView.classList.add('active');

    // Trigger Turn countdown timer
    this.startTimer();
  },

  submitAnswer(selectedIndex) {
    this.isProcessingTurn = true;
    this.questionsAttempted++;
    this.stopTimer();

    const correctIndex = this.activeQuestion.correctIndex;
    const isCorrect = selectedIndex === correctIndex;

    // Visual feedback for options
    this.optionButtons.forEach((btn, idx) => {
      if (idx === correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('incorrect');
      }
    });

    // Rogue Perk: speed window extended to 12 seconds (timeLeft >= 3.0)
    const speedThreshold = this.selectedClass === 'rogue' ? 3.0 : 5.0;
    const isFirstTenSeconds = this.timeLeft >= speedThreshold;

    if (isCorrect) {
      this.correctAnswers++;
      SoundFX.play('correct');
      
      if (isFirstTenSeconds) {
        this.isSpeedBonus = true;
        const goldBonus = this.selectedClass === 'rogue' ? 10 : 5;
        this.floorGoldEarned += goldBonus;
        this.gold += goldBonus; // Direct gold addition
        document.getElementById('gold-value').innerText = this.gold;
        this.addLogEntry(`SPEED BONUS: Solved fast! +50% Spell Power & +${goldBonus} Gold!`, 'system-alert');
      } else {
        this.addLogEntry(`Correct calculation! Casting ${this.activeSpell.toUpperCase()}!`, 'player-action');
      }
      
      // Animate player card flash green
      const pCard = document.getElementById('player-card');
      pCard.classList.add('card-flash-correct');
      setTimeout(() => pCard.classList.remove('card-flash-correct'), 400);

      // Cast spell logic
      setTimeout(() => {
        this.executePlayerSpell();
      }, 1000);
    } else {
      SoundFX.play('incorrect');

      if (isFirstTenSeconds) {
        this.isSpeedPenalty = true;
        this.playerHP = Math.max(0, this.playerHP - 10);
        this.updateHPBars();
        this.popupText('player', '-10', false);
        this.addLogEntry(`SPEED PENALTY: Guessing error! Suffer -10 HP backlash!`, 'enemy-action');
        
        // Shake player card
        const pCard = document.getElementById('player-card');
        pCard.classList.add('shake');
        pCard.classList.add('card-flash-incorrect');
        setTimeout(() => {
          pCard.classList.remove('shake');
          pCard.classList.remove('card-flash-incorrect');
        }, 400);
      } else {
        this.addLogEntry(`Formula failed! Your spell fizzled...`, 'system-alert');
        const pCard = document.getElementById('player-card');
        pCard.classList.add('card-flash-incorrect');
        setTimeout(() => pCard.classList.remove('card-flash-incorrect'), 400);
      }

      // Check if speed penalty killed the player
      if (this.playerHP <= 0) {
        setTimeout(() => {
          this.defeat();
        }, 1000);
      } else {
        // Skip player action and go to enemy turn
        setTimeout(() => {
          this.executeEnemyTurn();
        }, 1000);
      }
    }
  },

  executePlayerSpell() {
    let dmgDealt = 0;
    let healAmt = 0;
    let shieldAmt = 0;

    switch (this.activeSpell) {
      case 'fireball':
        dmgDealt = 15;
        SoundFX.play('fireball');
        break;
      case 'lightning':
        dmgDealt = 30;
        SoundFX.play('lightning');
        break;
      case 'ice':
        shieldAmt = 15;
        SoundFX.play('shield');
        break;
      case 'heal':
        healAmt = 20;
        SoundFX.play('heal');
        break;
    }

    // Mage Perk: +10% Spell Power, and +5 Shield on Heal
    if (this.selectedClass === 'mage') {
      dmgDealt = Math.round(dmgDealt * 1.1);
      healAmt = Math.round(healAmt * 1.1);
      shieldAmt = Math.round(shieldAmt * 1.1);
      if (this.activeSpell === 'heal') {
        shieldAmt += 5;
      }
    }

    // Apply speed bonus multiplier (+50%)
    if (this.isSpeedBonus) {
      dmgDealt = Math.round(dmgDealt * 1.5);
      healAmt = Math.round(healAmt * 1.5);
      shieldAmt = Math.round(shieldAmt * 1.5);
      this.isSpeedBonus = false; // Reset
    }

    // Apply Player Actions
    if (dmgDealt > 0) {
      // Enemy blocks a portion if defending
      if (this.enemyIntent === 'defend') {
        const blockVal = Math.round(this.enemyAttack * 0.4);
        dmgDealt = Math.max(2, dmgDealt - blockVal);
        this.addLogEntry(`${this.enemyName} blocks with shield, absorbing some damage!`, 'enemy-action');
      }

      this.enemyHP = Math.max(0, this.enemyHP - dmgDealt);
      this.popupText('enemy', `-${dmgDealt}`, false);
      this.addLogEntry(`You dealt ${dmgDealt} DMG to ${this.enemyName}!`, 'player-action');
      
      // Shake enemy card
      const eCard = document.getElementById('enemy-card');
      eCard.classList.add('shake');
      setTimeout(() => eCard.classList.remove('shake'), 400);
    }

    if (shieldAmt > 0) {
      this.playerShield += shieldAmt;
      this.addLogEntry(`You conjure an Ice Shield! (+${shieldAmt} Shield)`, 'player-action');
      this.popupText('player', `+${shieldAmt}`, true); // heal color for shield
    }

    if (healAmt > 0) {
      this.playerHP = Math.min(this.playerMaxHP, this.playerHP + healAmt);
      this.addLogEntry(`You drink a potion and heal for ${healAmt} HP!`, 'player-action');
      this.popupText('player', `+${healAmt}`, true);
    }

    this.updateHPBars();

    // Check if enemy defeated
    if (this.enemyHP <= 0) {
      setTimeout(() => {
        this.victory();
      }, 800);
    } else {
      setTimeout(() => {
        this.executeEnemyTurn();
      }, 1000);
    }
  },

  executeEnemyTurn() {
    this.addLogEntry(`${this.enemyName} attacks!`, 'enemy-action');

    let rawDmg = 0;
    if (this.enemyIntent === 'attack') {
      rawDmg = this.enemyAttack;
    } else if (this.enemyIntent === 'heavy') {
      rawDmg = Math.round(this.enemyAttack * 1.5);
      this.addLogEntry(`CRITICAL: A powerful blow lands!`, 'enemy-action');
    } else if (this.enemyIntent === 'defend') {
      // Small damage even when blocking
      rawDmg = Math.round(this.enemyAttack * 0.3);
    }

    // Knight Perk: Flat -2 Damage taken
    let finalDmg = rawDmg;
    if (this.selectedClass === 'knight' && finalDmg > 0) {
      finalDmg = Math.max(0, finalDmg - 2);
    }

    // Apply shield absorption
    if (this.playerShield > 0) {
      const absorption = Math.min(this.playerShield, finalDmg);
      this.playerShield -= absorption;
      finalDmg -= absorption;
      this.addLogEntry(`Your shield absorbs ${absorption} DMG!`, 'player-action');
    }

    if (finalDmg > 0) {
      this.playerHP = Math.max(0, this.playerHP - finalDmg);
      this.addLogEntry(`${this.enemyName} deals ${finalDmg} DMG to you.`, 'enemy-action');
      this.popupText('player', `-${finalDmg}`, false);
      SoundFX.play('damage');
      
      // Shake player card
      const pCard = document.getElementById('player-card');
      pCard.classList.add('shake');
      setTimeout(() => pCard.classList.remove('shake'), 400);
    } else {
      this.addLogEntry(`No damage penetrated your magical barrier!`, 'player-action');
    }

    this.updateHPBars();

    // Check if player defeated
    if (this.playerHP <= 0) {
      setTimeout(() => {
        this.defeat();
      }, 800);
    } else {
      // Start next turn
      this.isProcessingTurn = false;
      this.updateEnemyIntent();
      this.showDeckView();
    }
  },

  popupText(target, text, isHeal) {
    const popId = target === 'player' ? 'player-dmg-pop' : 'enemy-dmg-pop';
    const el = document.getElementById(popId);
    if (!el) return;

    el.innerText = text;
    el.className = isHeal ? 'dmg-floating heal animate-dmg' : 'dmg-floating animate-dmg';
    
    // Clear animation class after execution to allow replay
    setTimeout(() => {
      el.classList.remove('animate-dmg');
    }, 1000);
  },

  victory() {
    SoundFX.play('victory');
    SoundFX.stopBGM(); // Stop music on victory screen
    this.stopTimer();
    this.addLogEntry(`Victory! You have vanquished the ${this.enemyName}!`, 'system-alert');

    // Calculate Gold reward
    const baseReward = this.currentFloor * 15;
    const accuracy = this.questionsAttempted > 0 ? (this.correctAnswers / this.questionsAttempted) : 1;
    const accuracyBonus = Math.round(baseReward * accuracy);
    const totalGoldEarned = baseReward + accuracyBonus;

    this.gold += totalGoldEarned;
    
    // Level progression (increase level every 50 gold)
    const oldLevel = this.level;
    this.level = Math.floor(this.gold / 50) + 1;
    
    // Unlock next floor (up to 20)
    if (this.currentFloor === this.unlockedFloor && this.unlockedFloor < 20) {
      this.unlockedFloor++;
    }

    this.saveGame();

    // Prepare Game Over UI
    const goScreen = this.screens.gameover;
    goScreen.className = "screen active victory";
    
    document.getElementById('result-title').innerText = "Victory!";
    let avatarSrc = "assets/mage.png";
    if (this.selectedClass === 'knight') avatarSrc = "assets/knight.png";
    else if (this.selectedClass === 'rogue') avatarSrc = "assets/rogue.png";
    document.getElementById('result-avatar').src = avatarSrc;
    document.getElementById('result-message').innerText = `You defeated the ${this.enemyName} and collected valuable algebraic artifacts! ${this.level > oldLevel ? 'LEVEL UP!' : ''}`;
    
    document.getElementById('res-floor').innerText = this.currentFloor;
    document.getElementById('res-gold').innerText = `+${totalGoldEarned}`;
    document.getElementById('res-accuracy').innerText = `${Math.round(accuracy * 100)}%`;

    // Toggle Next Floor button
    if (this.currentFloor < 20) {
      this.btnNextFloor.style.display = 'block';
    } else {
      this.btnNextFloor.style.display = 'none';
      document.getElementById('result-message').innerText += " Congratulations! You've conquered all 20 floors of the MathQuest dungeon!";
    }

    this.changeScreen('gameover');
  },

  defeat() {
    SoundFX.play('defeat');
    SoundFX.stopBGM(); // Stop BGM on defeat
    this.stopTimer();
    this.addLogEntry(`You were defeated by the ${this.enemyName}...`, 'system-alert');

    // Prepare Game Over UI
    const goScreen = this.screens.gameover;
    goScreen.className = "screen active defeat";
    
    document.getElementById('result-title').innerText = "Defeated...";
    let avatarSrc = "assets/mage.png";
    if (this.selectedClass === 'knight') avatarSrc = "assets/knight.png";
    else if (this.selectedClass === 'rogue') avatarSrc = "assets/rogue.png";
    document.getElementById('result-avatar').src = avatarSrc;
    document.getElementById('result-message').innerText = `The algebraic magical fields collapsed. Return to camp to revise formulas.`;
    
    document.getElementById('res-floor').innerText = this.currentFloor;
    document.getElementById('res-gold').innerText = "+0";
    
    const accuracy = this.questionsAttempted > 0 ? (this.correctAnswers / this.questionsAttempted) : 0;
    document.getElementById('res-accuracy').innerText = `${Math.round(accuracy * 100)}%`;

    this.btnNextFloor.style.display = 'none';

    this.changeScreen('gameover');
  },

  addLogEntry(text, type) {
    const entry = document.createElement('p');
    entry.className = `log-entry ${type || ''}`;
    entry.innerText = text;
    this.combatLog.appendChild(entry);
    
    // Auto-scroll combat log to bottom
    this.combatLog.scrollTop = this.combatLog.scrollHeight;
  },

  clearCombatLog() {
    this.combatLog.innerHTML = "";
  },

  // Start turn timer countdown
  startTimer() {
    this.stopTimer(); // Ensure clean state
    this.timeLeft = 15.0;
    
    const timerContainer = document.getElementById('timer-container');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-sec');

    timerContainer.style.display = 'block';
    timerText.innerText = Math.ceil(this.timeLeft);
    timerBar.style.width = '100%';
    timerBar.className = 'timer-bar-fill';

    this.timerInterval = setInterval(() => {
      // Pause updates if turn logic is processing animations
      if (this.isProcessingTurn) {
        clearInterval(this.timerInterval);
        return;
      }

      this.timeLeft -= 0.1;
      
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }

      // Update text
      timerText.innerText = Math.ceil(this.timeLeft);
      
      // Update progress bar width
      const pct = (this.timeLeft / this.timerDuration) * 100;
      timerBar.style.width = `${pct}%`;

      // Warning color shifts
      if (this.timeLeft <= 5.0) {
        timerBar.className = 'timer-bar-fill timer-warning-low';
      } else if (this.timeLeft <= 10.0) {
        timerBar.className = 'timer-bar-fill timer-warning-medium';
      } else {
        timerBar.className = 'timer-bar-fill';
      }
    }, 100);
  },

  // Stop/Clear turn timer
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
      timerContainer.style.display = 'none';
    }
  },

  // Handler for timer ticking to 0
  handleTimeout() {
    this.isProcessingTurn = true;
    this.questionsAttempted++;
    SoundFX.play('incorrect');
    this.addLogEntry("TIME OUT! You took too long to solve the formula.", "system-alert");

    // Animate player card damage flash
    const pCard = document.getElementById('player-card');
    pCard.classList.add('card-flash-incorrect');
    setTimeout(() => pCard.classList.remove('card-flash-incorrect'), 400);

    // Go straight to enemy counter-attack
    setTimeout(() => {
      this.executeEnemyTurn();
    }, 1000);
  }
};

// Initialize Game when page loads
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
