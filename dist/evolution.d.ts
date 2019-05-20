interface ICoefs {
    a: number;
    b: number;
    c: number;
}
interface IParentsPair {
    first: ICoefs;
    second: ICoefs;
}
export declare function create_target_func(data: number[]): (coefs: ICoefs) => number;
export declare class GeneticEvolution {
    private target_func;
    private min;
    private max;
    private mutation_probability;
    private irregularity_coef;
    private population;
    private population_quality;
    private parent_probabilities;
    constructor(target_func: any, min?: number, max?: number, mutation_probability?: number, irregularity_coef?: number);
    generateRandomPopulation(size: number): void;
    initialize(size?: number): void;
    calculatePopulationQuality(): void;
    calculateParentProbability(): void;
    selectParentsPair(): IParentsPair;
    selectParents(): IParentsPair[];
    evolute(n?: number): ICoefs;
    crossover(parents_pair: IParentsPair): [ICoefs, ICoefs];
    mutate(individual: ICoefs, max: number, min: number, current_era: number, number_epochs: number, mutation_probability: number, b: number): ICoefs;
    killing(): void;
}
export {};
