"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evolution_1 = require("./evolution");
let fr = [
    0.16698255750868055,
    0.3166226535373264,
    0.4758543226453993,
    0.7116153971354167,
    0.2438616943359375,
    0.13705584208170574,
];
const target_func = evolution_1.create_target_func(fr);
let genetic = new evolution_1.GeneticEvolution(target_func);
genetic.initialize();
let coefs = genetic.evolute();
console.log(coefs);
//# sourceMappingURL=main.js.map