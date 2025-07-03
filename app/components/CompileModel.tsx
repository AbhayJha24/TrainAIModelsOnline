import {Sequential,sequential, layers} from '@tensorflow/tfjs';
import {ModelState, ModelAction} from '../types/ModelStateControlTypes';
import { useState } from 'react';
import optimizerMap from '../dependencies/OptimizerMap';
import getLossFunction from '../dependencies/LossMap';
import ShowInfoModal from '../types/ShowInfoModalTypes';

type CompileModelProps = {
    styles: { readonly [key: string]: string; },
    modelStateControls: {
        modelState : ModelState,
        modelDispatcher: React.ActionDispatch<[action:ModelAction]>
    }
    modelControls: {
        model: Sequential,
        setModel: React.Dispatch<React.SetStateAction<Sequential>>
    },
    setShowInfoModal: React.Dispatch<React.SetStateAction<ShowInfoModal>>
}

export default function CompileModel({styles, modelStateControls, modelControls, setShowInfoModal}: CompileModelProps) {

    const [modelSummary, SetModelSummary] = useState<string>("Click on Compile Model")
    
    async function compileModel() {
        const nModel:Sequential = sequential();

        modelStateControls.modelState.layers.forEach((layer, idx)=>{
            if (idx==0) {
                nModel.add(layers.dense({units:layer.units, activation:layer.activationFunction, inputShape:[layer.inputShape === undefined ? null : layer.inputShape]}))
            }
            else{
                nModel.add(layers.dense({units:layer.units, activation:layer.activationFunction}))
            }
        })

        if(modelStateControls.modelState.optimizer === "default" && modelStateControls.modelState.lossFunction === "default"){
            setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "First Choose an Optimizer and a Loss Function from the Dropdown Below!", type:'error'})
            return
        }
        if(modelStateControls.modelState.optimizer === "default"){
            setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "First Choose an Optimizer from the Dropdown Below!", type:'error'})
            return
        }
        if(modelStateControls.modelState.lossFunction === "default"){
            setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "First Choose a Loss Function from the Dropdown Below!", type:'error'})
            return
        }

        try {
            nModel.compile({optimizer: optimizerMap[modelStateControls.modelState.optimizer](modelStateControls.modelState.learningRate),loss: getLossFunction(modelStateControls.modelState.lossFunction), metrics: ["accuracy"]});
            let summary:string = "";
            nModel.summary(80,undefined,m=>summary="\n"+summary+ "\n" + m);
            SetModelSummary(summary.trim())
            modelControls.setModel(nModel);
        } catch (error) {

            let message = "";

            if (error instanceof Error) {
                message = error.message
            }
            else {
                message = String(error)
            }

            setShowInfoModal({visibility:true, message: "Model Compilation Error", description: `${message}`, type:'error'});
        }
    }
  return (
    <section className={styles.compileModel}>
        <h1>Compile Model</h1>
        <h2>Model Hyperparameters</h2>
        <form className={styles.compilationHyperparameters}>
            <div className={styles.hyperparameter}>
                <label>Optimizer: </label>
                <select onChange={e => modelStateControls.modelDispatcher({type:"set_optimizer", payload:{index:0, value: e.target.value}})}>
                    <option value="default">Choose..</option>
                    <option value="adadelta">Adadelta</option>
                    <option value="adagrad">Adagrad</option>
                    <option value="adam">Adam</option>
                    <option value="adamax">Adamax</option>
                    <option value="momentum">Momentum</option>
                    <option value="rmsprop">Rmsprop</option>
                    <option value="sgd">Sgd</option>
                </select>
            </div>
            <div className={styles.hyperparameter}>
                <label>Learning Rate: </label>
                <input type="number" value={modelStateControls.modelState.learningRate} onChange={e => modelStateControls.modelDispatcher({type:"set_learning_rate", payload:{index:0, value: e.target.value}})}/>
            </div>
            <div className={styles.hyperparameter}>
                <label>Loss Function: </label>
                <select onChange={e => modelStateControls.modelDispatcher({type:"set_loss_function", payload:{index:0, value: e.target.value}})}>
                    <option value="default">Choose..</option>
                    <option value="absoluteDifference">Absolute Difference</option>
                    <option value="computeWeightedLoss">Compute Weighted Loss</option>
                    <option value="cosineDistance">Cosine Distance</option>
                    <option value="hingeLoss">Hinge Loss</option>
                    <option value="huberLoss">Huber Loss</option>
                    <option value="logLoss">Log Loss</option>
                    <option value="meanSquaredError">Mean Squared Error</option>
                    <option value="sigmoidCrossEntropy">Sigmoid Cross Entropy</option>
                    <option value="softmaxCrossEntropy">Softmax Cross Entropy</option>
                </select>
            </div>
        </form>
        <button type='button' onClick={e=>{e.stopPropagation(); compileModel()}} className={styles.compileButton}>Compile!</button>
        <pre>
            <code className={styles.codeBlock}>
                <p className={styles.summaryText}>{modelSummary}</p>
            </code>
        </pre>
    </section>
  )
}

