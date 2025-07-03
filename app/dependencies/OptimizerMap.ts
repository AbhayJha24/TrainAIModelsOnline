import { train } from "@tensorflow/tfjs"
import OptimizerMap from "../types/OptimizerMapTypes"

const optimizerMap : OptimizerMap = {
"adadelta": (lr:number) => train.adadelta(lr),
"adagrad": (lr:number) => train.adagrad(lr),
"adam": (lr:number) => train.adam(lr),
"adamax": (lr:number) => train.adamax(lr),
"momentum": (lr:number, oSP) => {if(oSP?.momentum) { return train.momentum(lr, oSP?.momentum)} else{ throw new Error("Momentum is required for momentum optimizer! NOTE: This is currently a known issue as you don't have an option to specify momentum and we are working on it.")}},
"rmsprop": (lr:number) => train.rmsprop(lr),
"sgd": (lr:number) => train.sgd(lr)
}

export default optimizerMap