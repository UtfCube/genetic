"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function create_target_func(data) {
    const target_func = (coefs) => {
        let target_value = 0;
        target_value = data.reduce((res, currentValue, currentIndex) => {
            return res += Math.pow((currentValue - (coefs.a * currentIndex * currentIndex + coefs.b * currentIndex + coefs.c)), 2);
        }, target_value);
        return target_value;
    };
    return target_func;
}
exports.create_target_func = create_target_func;
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomIntNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createChilds(first, second) {
    const a = getRandomNumber(0, 1);
    const createChild = (first, second, a) => a * first + (1 - a) * second;
    const new_first = createChild(first, second, a);
    const new_second = createChild(second, first, a);
    return [new_first, new_second];
}
function mutateUnevely(element, max, min, current_era, number_epochs, r, xe, b) {
    const sigma = (t, y) => {
        return y * (1 - Math.pow(r, Math.pow(1 - t / number_epochs, b)));
    };
    let res = element + Math.pow(-1, xe) * sigma(current_era, xe === 0 ? max - element : element - min);
    return res;
}
class GeneticEvolution {
    constructor(target_func, min = -100, max = 100, mutation_probability = 0.05, irregularity_coef = 10) {
        this.target_func = target_func;
        this.min = min;
        this.max = max;
        this.mutation_probability = mutation_probability;
        this.irregularity_coef = irregularity_coef;
        this.population = [];
        this.population_quality = 0;
        this.parent_probabilities = [];
    }
    generateRandomPopulation(size) {
        for (let i = 0; i < size; i++) {
            let coefs = {
                a: getRandomNumber(this.min, this.max),
                b: getRandomNumber(this.min, this.max),
                c: getRandomNumber(this.min, this.max)
            };
            this.population.push(coefs);
        }
    }
    initialize(size = 100) {
        this.generateRandomPopulation(size);
    }
    calculatePopulationQuality() {
        const qualities = this.population.map(this.target_func);
        this.population_quality = qualities.reduce((a, b) => a + b, 0);
    }
    calculateParentProbability() {
        this.calculatePopulationQuality();
        this.parent_probabilities = this.population.map(x => {
            let parent_probability = {
                individual: x,
                probability: this.target_func(x) / this.population_quality
            };
            return parent_probability;
        });
    }
    selectParentsPair() {
        let firts_parent_index = getRandomIntNumber(0, this.population.length - 1);
        let others = [...this.population];
        others.splice(firts_parent_index, 1);
        let second_parent_index = getRandomIntNumber(0, others.length - 1);
        let first_parent = this.population[firts_parent_index];
        let second_parent = others[second_parent_index];
        return { first: first_parent, second: second_parent };
    }
    selectParents() {
        let parents_pairs = [];
        for (let i = 0; i < this.population.length / 2; i++) {
            parents_pairs.push(this.selectParentsPair());
        }
        return parents_pairs;
    }
    evolute(n = 1000) {
        for (let i = 0; i < n; i++) {
            let parents_pairs = this.selectParents();
            let new_individuals_pairs = parents_pairs.map(this.crossover);
            let new_individuals = [].concat.apply([], new_individuals_pairs);
            new_individuals = new_individuals.map(x => this.mutate(x, this.max, this.min, i, n, this.mutation_probability, this.irregularity_coef));
            this.population = [...this.population, ...new_individuals];
            this.killing();
        }
        this.population.sort((a, b) => (this.target_func(a) > this.target_func(b)) ? 1 : (this.target_func(a) < this.target_func(b)) ? -1 : 0);
        return this.population[0];
    }
    crossover(parents_pair) {
        const { first, second } = parents_pair;
        const new_a_coefs = createChilds(first.a, second.a);
        const new_b_coefs = createChilds(first.b, second.b);
        const new_c_coefs = createChilds(first.c, second.c);
        const first_child = {
            a: new_a_coefs[0],
            b: new_b_coefs[0],
            c: new_c_coefs[0]
        };
        const second_child = {
            a: new_a_coefs[1],
            b: new_b_coefs[1],
            c: new_c_coefs[1]
        };
        return [first_child, second_child];
    }
    mutate(individual, max, min, current_era, number_epochs, mutation_probability, b) {
        if (Math.random() < mutation_probability) {
            const xe = getRandomIntNumber(0, 1);
            const r = getRandomNumber(0, 1);
            const mutated_individual = {
                a: mutateUnevely(individual.a, max, min, current_era, number_epochs, r, xe, b),
                b: mutateUnevely(individual.b, max, min, current_era, number_epochs, r, xe, b),
                c: mutateUnevely(individual.c, max, min, current_era, number_epochs, r, xe, b),
            };
            return mutated_individual;
        }
        return individual;
    }
    killing() {
        this.calculateParentProbability();
        this.parent_probabilities.sort((a, b) => a.probability - b.probability);
        let killing_individuals = this.parent_probabilities.slice(this.population.length / 2).map(x => x.individual);
        this.population = this.population.filter(x => !killing_individuals.includes(x));
    }
}
exports.GeneticEvolution = GeneticEvolution;
//# sourceMappingURL=evolution.js.map