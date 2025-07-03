import { DataFrame, LabelEncoder } from 'danfojs';
import {ProcessedDataState, ProcessedDataAction} from '../types/ProcessedDataStateControlTypes';
import deepClone from '../dependencies/deepClone';

export default function processedDataReducer(prevState:ProcessedDataState, action:ProcessedDataAction) {

    const nS:ProcessedDataState = deepClone(prevState);

    switch (action.type) {
        case "add_features":
            nS.features = action.payload.value as DataFrame;
            break;
            
        case "add_target":
            nS.target = action.payload.value as DataFrame;
            break;

        case "add_label_encoder":
            nS.labelEncoders?.push(action.payload.value as LabelEncoder);
            break;
    
        default:
            break;
    }

    return nS;
}