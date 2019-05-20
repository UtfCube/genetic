interface ICoefs {
  a: number,
  b: number,
  c: number
}

interface IParentProbability {
  individual: ICoefs,
  probability: number
}

interface IParentsPair {
  first: ICoefs,
  second: ICoefs
}


export function create_target_func(data: number[]) {
  const target_func = (coefs: ICoefs) => {
    let target_value: number = 0;
    target_value = data.reduce((res: number, currentValue: number, currentIndex: number) : number => {
      return res += Math.pow((currentValue - (coefs.a * currentIndex * currentIndex + coefs.b * currentIndex + coefs.c)), 2)
    }, target_value)
    return target_value;
  }
  return target_func
}

function getRandomNumber(min: number, max: number) : number {
  return Math.random() * (max - min) + min;
}

function getRandomIntNumber(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createChilds(first: number, second: number) {
  const a: number = getRandomNumber(0, 1);
  const createChild = (first: number, second: number, a: number) => a * first + (1 - a) * second;
  const new_first: number = createChild(first, second, a);
  const new_second: number = createChild(second, first, a);
  return [new_first, new_second];
}

function mutateUnevely(
  element: number, max: number, min: number, current_era: number, 
  number_epochs: number, r: number, xe: number, b: number) {
    
  const sigma = (t: number, y: number) => {
    return y * (1 - Math.pow(r, Math.pow(1 - t / number_epochs, b)));
  }
  let res = element + Math.pow(-1, xe) * sigma(current_era, xe === 0 ? max - element : element - min);
  return res;
}

export class GeneticEvolution {

  private population: ICoefs[];
  private population_quality: number;
  private parent_probabilities: IParentProbability[];

  constructor(
    private target_func: any,
    private min: number = -100,
    private max: number = 100,
    private mutation_probability: number = 0.05,
    private irregularity_coef: number = 10,
  ) {
    this.population = [];
    this.population_quality = 0;
    this.parent_probabilities = []
  }

  generateRandomPopulation(size: number) {
    for (let i = 0; i < size; i++) {
      let coefs: ICoefs = {
        a: getRandomNumber(this.min, this.max),
        b: getRandomNumber(this.min, this.max),
        c: getRandomNumber(this.min, this.max)
      };
      this.population.push(coefs);
    }
  }

  initialize(size: number = 100) {
    this.generateRandomPopulation(size);
  }

  calculatePopulationQuality() {
    const qualities: number[] = this.population.map(this.target_func);
    this.population_quality = qualities.reduce((a: number, b: number) => a + b, 0)
  }

  calculateParentProbability() {
    this.calculatePopulationQuality();
    this.parent_probabilities = this.population.map(x => {
      let parent_probability: IParentProbability = {
        individual: x,
        probability: this.target_func(x) / this.population_quality
      }
      //console.log(this.parent_probabilities);
      return parent_probability;
    })
  }

  selectParentsPair(): IParentsPair {
    let firts_parent_index = getRandomIntNumber(0, this.population.length - 1);
    let others = [...this.population];
    others.splice(firts_parent_index, 1);
    let second_parent_index = getRandomIntNumber(0, others.length - 1);
    let first_parent = this.population[firts_parent_index];
    let second_parent = others[second_parent_index];
    /*
    let first_parent_probability: IParentProbability = undefined;
    while (first_parent_probability === undefined) {
      first_parent_probability = this.parent_probabilities.find(x => Math.random() < x.probability);
    }
    let others: IParentProbability[] = [...this.parent_probabilities];
    others.splice(others.indexOf(first_parent_probability), 1);
    let second_parent_probability: IParentProbability = undefined;
    while (second_parent_probability === undefined) {
      second_parent_probability = others.find(x => Math.random() < x.probability);
    }
    */
    return {first: first_parent, second: second_parent};
  }

  selectParents(): IParentsPair[] {
    //this.calculateParentProbability();
    let parents_pairs: IParentsPair[] = []; 
    for (let i = 0; i < this.population.length / 2; i++)
    {
      parents_pairs.push(this.selectParentsPair());
    }
    return parents_pairs;
  }

  evolute(n: number = 1000): ICoefs {
    for (let i = 0; i < n; i++) {
      let parents_pairs = this.selectParents();
      let new_individuals_pairs: [ICoefs, ICoefs][] = parents_pairs.map(this.crossover);
      let new_individuals: ICoefs[] = [].concat.apply([], new_individuals_pairs);
      new_individuals = new_individuals.map(x => this.mutate(x, this.max, this.min, i, n, this.mutation_probability, this.irregularity_coef));
      this.population = [...this.population, ...new_individuals];
      this.killing()
    }
    this.population.sort((a, b) => (this.target_func(a) > this.target_func(b)) ? 1 : (this.target_func(a) < this.target_func(b)) ? -1 : 0)
    return this.population[0];
  }

  crossover(parents_pair: IParentsPair): [ICoefs, ICoefs] {
    const {first, second} = parents_pair;
    const new_a_coefs = createChilds(first.a, second.a);
    const new_b_coefs = createChilds(first.b, second.b);
    const new_c_coefs = createChilds(first.c, second.c)
    const first_child: ICoefs = {
      a: new_a_coefs[0],
      b: new_b_coefs[0],
      c: new_c_coefs[0]
    }
    const second_child: ICoefs = {
      a: new_a_coefs[1],
      b: new_b_coefs[1],
      c: new_c_coefs[1]
    }
    return [first_child, second_child];
  }

  mutate(individual: ICoefs, max: number, min: number, current_era: number, 
    number_epochs: number, mutation_probability: number, b: number): ICoefs {
    if (Math.random() < mutation_probability) {
      const xe = getRandomIntNumber(0, 1);
      const r = getRandomNumber(0, 1)
      const mutated_individual: ICoefs = {
        a: mutateUnevely(individual.a, max, min, current_era, number_epochs, getRandomNumber(0, 1), getRandomIntNumber(0, 1), b),
        b: mutateUnevely(individual.b, max, min, current_era, number_epochs, getRandomNumber(0, 1), getRandomIntNumber(0, 1), b),
        c: mutateUnevely(individual.c, max, min, current_era, number_epochs, getRandomNumber(0, 1), getRandomIntNumber(0, 1), b),
      }
      return mutated_individual;
    }
    return individual; 
  }

  killing() {
    this.calculateParentProbability();
    this.parent_probabilities.sort((a, b) => a.probability - b.probability);
    let killing_individuals: ICoefs[] = this.parent_probabilities.slice(this.population.length / 2).map(x => x.individual);
    this.population = this.population.filter(x => !killing_individuals.includes(x));
  }
}