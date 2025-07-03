type ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | 'gelu' | 'gelu_new' | 'mish' | 'swish';

type ModelState = {
    nlayers:number,
    layers:[{
        units: number,
        activationFunction: ActivationIdentifier,
        inputShape?: number
    }],
    optimizer: string,
    learningRate: number,
    lossFunction: string,
    batchSize: number,
    epochs: number
}

type ModelAction = {
    type: string,
    payload?: {
        index: number,
        value?: string;
    };
}

export type {ModelState, ModelAction, ActivationIdentifier};