import { DataFrame, LabelEncoder } from "danfojs";

type ProcessedDataState = {
    features: DataFrame | undefined,
    target: DataFrame | undefined,
    labelEncoders: Array<LabelEncoder>;
}

type ProcessedDataAction = {
    type: string,
    payload: {
        value: DataFrame | LabelEncoder;
    };
}

export type {ProcessedDataState, ProcessedDataAction};