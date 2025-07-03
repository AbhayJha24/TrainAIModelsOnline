import { losses } from "@tensorflow/tfjs";
import {CosineDistanceLossFnMap, StandardLossFnMap, WeightedLossFnMap} from "../types/LossMapTypes";

const lossMap: StandardLossFnMap = {
    "absoluteDifference": losses.absoluteDifference,
    "hingeLoss": losses.hingeLoss,
    "huberLoss": losses.huberLoss,
    "logLoss": losses.logLoss,
    "meanSquaredError": losses.meanSquaredError,
    "sigmoidCrossEntropy": losses.sigmoidCrossEntropy,
    "softmaxCrossEntropy": losses.softmaxCrossEntropy
}

const weightedLossFnMap : WeightedLossFnMap = {
    "computeWeightedLoss": losses.computeWeightedLoss,
}

const cosineDistanceLossFnMap : CosineDistanceLossFnMap = {
    "cosineDistance": losses.cosineDistance
}

export default function getLossFunction(lossFunction:string) {
    return (lossMap[lossFunction] ?? weightedLossFnMap[lossFunction]) ?? cosineDistanceLossFnMap[lossFunction]
}
