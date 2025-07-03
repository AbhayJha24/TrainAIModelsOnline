import { Rank, Reduction, Tensor, TensorLike } from "@tensorflow/tfjs-core"

type StandardLossFnMap = {
    [key:string] : <T extends Tensor<Rank>, O extends Tensor<Rank>>(
    labels: TensorLike | T,
    predictions: TensorLike | T,
    weights?: TensorLike | Tensor<Rank>,
    reduction?: Reduction
    ) => O;
}

type CosineDistanceLossFnMap = {
    [key:string] : <T extends Tensor<Rank>, O extends Tensor<Rank>>(
    labels: TensorLike | T,
    predictions: TensorLike | T,
    axis: number,
    weights?: TensorLike | Tensor<Rank>,
    reduction?: Reduction
    ) => O;
}

type WeightedLossFnMap = {
[key:string] : <T extends Tensor<Rank>, O extends Tensor<Rank>>(
  losses: TensorLike | T,
  weights?: TensorLike | Tensor<Rank>,
  reduction?: Reduction
) => O;
}

export type {StandardLossFnMap, WeightedLossFnMap, CosineDistanceLossFnMap}