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
  //const data: number[] = frame.map(x => x.nose);
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

function float64ToBytesBuffer(n: number) {
  let tmp = new Float64Array(1);
  tmp[0] = n;
  return Buffer.from(tmp.buffer);
}

function swapCoefs(first: number, second: number) {
  const first_buf = float64ToBytesBuffer(first);
  const second_buf = float64ToBytesBuffer(second);
  let start_index = getRandomIntNumber(0, 7);
  let first_subbuf = first_buf.slice(start_index);
  let second_subbuf = second_buf.slice(start_index);
  const new_first_buf = Buffer.concat([first_buf.slice(0, start_index), second_subbuf]);
  const new_second_buf = Buffer.concat([second_buf.slice(0, start_index), first_subbuf]);
  //console.log(first, new_first_buf.readDoubleLE(0));
  //console.log(second, new_second_buf.readDoubleLE(0));
  first = new_first_buf.readDoubleLE(0);
  second = new_second_buf.readDoubleLE(0);
  return [first, second];
}

export class GeneticEvolution {

  private population: ICoefs[];
  private population_quality: number;
  private parent_probabilities: IParentProbability[];

  constructor(
    private target_func: any,
    private mutation_probability: number = 0.05,
    private killing_probability: number = 0.2,
    private max_pairs: number = 1000
  ) {
    this.population = [];
    this.population_quality = 0;
    this.parent_probabilities = []
  }

  generateRandomPopulation(size: number) {
    //let coefs_ar: ICoefs[] = []
    for (let i = 0; i < size; i++) {
      let coefs: ICoefs = {
        a: getRandomNumber(1, 10),
        b: getRandomNumber(-10, 10),
        c: getRandomNumber(-10, 10)
      };
      this.population.push(coefs);
      //coefs_ar.push(coefs);
    }
  }

  initialize(size: number = 10) {
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
    //console.log(others, others.length);
    let second_parent_index = getRandomIntNumber(0, others.length - 1);
    //console.log(firts_parent_index, second_parent_index);
    let first_parent = this.population[firts_parent_index];
    let second_parent = others[second_parent_index];
    //console.log(first_parent, second_parent);
    //let first_p: IParentProbability = this.parent_probabilities.find(x => Math.random() > x.probability);
    //let others: IParentProbability[] = [...this.parent_probabilities];
    //others.splice(others.indexOf(first_p), 1);
    //let second_p: IParentProbability = this.parent_probabilities.find(x => Math.random() > x.probability);
    //let prob = second_p.individual;
    return {first: first_parent, second: second_parent};
  }

  selectParents(): IParentsPair[] {
    this.calculateParentProbability();
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
      //new_individuals = new_individuals.map(this.mutate);
      this.population = [...this.population, ...new_individuals];
      this.killing()
    }
    this.population.sort((a, b) => (this.target_func(a) > this.target_func(b)) ? 1 : (this.target_func(a) < this.target_func(b)) ? -1 : 0)
    return this.population[0];
  }

  crossover(parents_pair: IParentsPair): [ICoefs, ICoefs] {
    const {first, second} = parents_pair;
    //let arr = new Float64Array(1);
    //arr[0] = first.a;
    //console.log(arr[0]);
    //const buf = Buffer.from(arr.buffer);
    //console.log(buf.readDoubleLE(0), first.a);
    //console.log(buf);
    const new_a_coefs = swapCoefs(first.a, second.a);
    const new_b_coefs = swapCoefs(first.b, second.b);
    const new_c_coefs = swapCoefs(first.c, second.c)
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
    /*
    const child: ICoefs = {
      a: (first.a + second.a) / 2,
      b: (first.b + second.b) / 2,
      c: (first.c + second.c) / 2,
    }
    */
    return [first_child, second_child];
  }

  mutate(individual: ICoefs): ICoefs {
    if (Math.random() < 0.05) {
      const mutated_individual: ICoefs = {
        a: individual.a * 0.01,
        b: individual.b * 0.01,
        c: individual.c * 0.01
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