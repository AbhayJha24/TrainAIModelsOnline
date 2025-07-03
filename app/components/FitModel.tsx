import { DataFrame } from "danfojs";
import { useState } from "react";
import { Sequential, sequential, layers } from '@tensorflow/tfjs';
import { ModelState, ModelAction } from "../types/ModelStateControlTypes";
import { ProcessedDataState, ProcessedDataAction } from "../types/ProcessedDataStateControlTypes";
import optimizerMap from "../dependencies/OptimizerMap";
import getLossFunction from "../dependencies/LossMap";
import ShowInfoModal from "../types/ShowInfoModalTypes";

type FitModelProps = {
    styles: { readonly [key: string]: string; },
    
    dataControls: {
        data: DataFrame | null,
        setData: React.Dispatch<React.SetStateAction<DataFrame|null>>
    },
    modelStateControls: {
        modelState : ModelState,
        modelDispatcher: React.ActionDispatch<[action:ModelAction]>
    },
    modelControls: {
        model: Sequential,
        setModel: React.Dispatch<React.SetStateAction<Sequential>>
    },
    processedDataControls:{
        processedData: ProcessedDataState,
        processedDataDispatcher: React.ActionDispatch<[action:ProcessedDataAction]>
    },
    setModelTrained: React.Dispatch<React.SetStateAction<boolean>>,
    setShowInfoModal: React.Dispatch<React.SetStateAction<ShowInfoModal>>
}

export default function FitModel({styles, modelStateControls, processedDataControls, setModelTrained, setShowInfoModal}:FitModelProps) {

    const [modelTrainingLogs, setModelTrainingLogs] = useState("Click on Start Training to begin training (NOTE: Will use your CPU,GPU & memory for training)")
    const [trainingProgress, setTrainingProgress] = useState(0)
    const [showProgress, setShowProgress] = useState(false)

    async function fitModel() {
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
        
        // Fit Model

        const features:DataFrame | undefined = processedDataControls.processedData.features;
        const target: DataFrame | undefined = processedDataControls.processedData.target;

        if (features && target) {
            let summary:string = "";

            if(modelStateControls.modelState.batchSize <= 0 && modelStateControls.modelState.epochs <= 0){
                setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "Set the number of epochs and batch size to a valid value first!", type:'error'})
                return
            }
            else if(modelStateControls.modelState.batchSize <= 0){
                setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "Set the batch size to a valid value first!", type:'error'})
                return
            }
            else if(modelStateControls.modelState.epochs <= 0){
                setShowInfoModal({visibility:true, message: "Hyperparameter Invalid Error", description: "Set the number of epochs to a valid value first!", type:'error'})
                return
            }

            setShowProgress(true);

            try {
                const fittedModel = await nModel.fit(features?.tensor, target?.tensor, {
                batchSize: modelStateControls.modelState.batchSize,
                epochs: modelStateControls.modelState.epochs,
                callbacks: {onEpochEnd(epoch, logs) {
                    summary="\n"+summary+ "\n" + `Epoch ${epoch + 1}: loss = ${logs?.loss} : Accuracy = ${logs?.acc}`;
                    setModelTrainingLogs(summary.trim())
                    setTrainingProgress(Math.round(((epoch+1)/modelStateControls.modelState.epochs)*100))
                }
            }
            });
            if(fittedModel){
                const savedResult = await nModel.save('localstorage://model');

                if (savedResult.errors) {
                    setShowInfoModal({visibility: true, message: "Model Auto-Save Error", description: "Some Error Occured while Auto-Saving the model! Check the console for details!", type:'error'})
                    console.log(savedResult.errors)
                }
                else{
                    setModelTrained(true);
                }
            }
            } catch (error) {
                let message = "";

            if (error instanceof Error) {
                message = error.message
            }
            else {
                message = String(error)
            }
                setShowProgress(false);
                setShowInfoModal({visibility:true, message: "Model Training Error", description: message, type:'error'})
            }
        }
        else{
            setShowInfoModal({visibility: true, message: "Dataset not Uploaded", description: "Data is not defined, upload a dataset using the option above!", type:'info'})
            return;
        }
    }

    return (
        <section className={styles.fitModel}>
            <h1>Fit Model</h1>
            <h2>Model Hyperparameters</h2>
            <form className={styles.compilationHyperparameters}>
                <div className={styles.hyperparameter}>
                    <label>Batch Size: </label>
                    <input type="number" value={modelStateControls.modelState.batchSize} onChange={e => modelStateControls.modelDispatcher({type:"set_batch_size", payload:{index:0, value: e.target.value}})}/>
                </div>
                <div className={styles.hyperparameter}>
                    <label>Epochs: </label>
                    <input type="number" value={modelStateControls.modelState.epochs} onChange={e=> modelStateControls.modelDispatcher({type:"set_epochs", payload:{index:0, value:e.target.value}})} />
                </div>
            </form>
            <button type='button' onClick={e=>{e.stopPropagation(); fitModel()}} className={styles.fitButton}>Start Training!</button>
            {showProgress && <><label htmlFor="">Training Progress: {trainingProgress}%</label><progress value={trainingProgress} max={100}></progress></>}
            <pre>
                <code className={styles.codeBlock}>
                    <p className={styles.summaryText}>{modelTrainingLogs}</p>
                </code>
            </pre>
        </section>
    )
}

