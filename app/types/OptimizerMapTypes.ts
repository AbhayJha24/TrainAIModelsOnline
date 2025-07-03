import { Optimizer } from "@tensorflow/tfjs"

type OptimizerMap = {
    [key: string]: (lr: number, optimizerSpecificParams?: {
        momentum?: number
    }) => Optimizer
}

export default OptimizerMap