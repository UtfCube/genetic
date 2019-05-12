import { create_target_func, GeneticEvolution} from './evolution';
/*
let fr = [ 
    0.16698255750868055,
    0.3166226535373264,
    0.4758543226453993,
    0.7116153971354167,
    0.2438616943359375,
    0.13705584208170574,
 ]
 */

    /*
    let fr = [ 0.17056093004014758,
        0.1640264214409722,
        0.16018424140082466,
        0.16698255750868055,
        0.3166226535373264,
        0.4758543226453993,
        0.7116153971354167,
        0.2438616943359375,
        0.13705584208170574,
        0.1412272474500868,
        0.14503455268012153,
        0.14520060221354167,
        0.14771484375000002,
        0.14939454820421005 ]
*/
let fr = [10, 5, 2, 1, 2, 10]


const target_func = create_target_func(fr);

let genetic = new GeneticEvolution(target_func);

genetic.initialize()
let coefs = genetic.evolute();

console.log(coefs);