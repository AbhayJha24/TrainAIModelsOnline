import deepClone from "../dependencies/deepClone";
import { ModelState, ModelAction, ActivationIdentifier } from "../types/ModelStateControlTypes";

export function modelReducer(prevState:ModelState, action:ModelAction):ModelState {
    const nS:ModelState = deepClone(prevState);
    switch (action.type) {
    case "dec_layers":
        nS["nlayers"] = prevState.nlayers === 1 ? 1: prevState.nlayers-1;
        if (prevState.nlayers === 1) {
            return nS;
        }

        nS.layers.pop();
        return nS;

    case "inc_layers":
        nS["nlayers"] = prevState.nlayers === 10 ? 10: prevState.nlayers+1;
        if (prevState.nlayers === 10) {
            return nS;
        }

        nS.layers.push({units: 1, activationFunction: "sigmoid"});
        return nS;

    case "change_activation":
        if (action.payload && action.payload.value) {

            nS.layers[action.payload.index].activationFunction = action.payload.value as ActivationIdentifier;
            return nS;
        }
        
        return nS;
            
    case "inc_units":
        if (action.payload) {
            nS.layers[action.payload.index].units = nS.layers[action.payload.index].units === 10 ? 10 : nS.layers[action.payload.index].units +=1;
            return nS;
        }
        
        return nS;
            
    case "dec_units":
        if (action.payload) {
            nS.layers[action.payload.index].units = nS.layers[action.payload.index].units === 1 ? 1 : nS.layers[action.payload.index].units -=1;
            return nS;
        }
        
        return nS;
            
    case "set_input_shape":
        if (action.payload && action.payload.value) {
            nS.layers[action.payload.index].inputShape = +action.payload.value;
            return nS;
        }
        
        return nS;

    case "set_optimizer":
        if(action.payload && action.payload.value){
            nS.optimizer = action.payload.value;
            return nS;
        }

        return nS;

    case "set_learning_rate":
        if(action.payload && action.payload.value){
            nS.learningRate = +action.payload.value;
            return nS;
        }

        return nS;

    case "set_loss_function":
        if(action.payload && action.payload.value){
            nS.lossFunction = action.payload.value;
            return nS;
        }

        return nS;

    case "set_batch_size":
        if(action.payload && action.payload.value){
            nS.batchSize = +action.payload.value;
            return nS;
        }

        return nS;

    case "set_epochs":
        if(action.payload && action.payload.value){
            nS.epochs = +action.payload.value;
            return nS;
        }

        return nS;
    
    default:
        return prevState;
    }
}