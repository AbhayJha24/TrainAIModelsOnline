import ModelDetails from './ModelDetails';
import ModelVisualizer from './ModelVisualizer';
import {ModelState,ModelAction} from '../types/ModelStateControlTypes';

type TrainModelProps = {
    styles: {readonly [key:string]:string};
    modelStateControls: {
      modelState:ModelState,
      modelDispatcher: React.ActionDispatch<[action: ModelAction]>
    }
}

export default function TrainModel({styles, modelStateControls}:TrainModelProps) {

  return (
    <section className={styles.trainModelSection} id='trainModel'>
        <h1>Select the Model and the hyperparameters</h1>
        <div className={styles.inputBox}>
            <label htmlFor="">Number of Layers :</label>
            <button type="button" className={styles.incDecButton} onClick={() => {modelStateControls.modelDispatcher({type:"dec_layers"})}}>-</button>
            <p>{modelStateControls.modelState.nlayers}</p>
            <button type="button" className={styles.incDecButton} onClick={() => {modelStateControls.modelDispatcher({type:"inc_layers"})}}>+</button>
        </div>

        <div className={styles.inputShapeInfo}>
            <h4>We will auto calculate the input shape based on your dataset</h4>
        </div>
        <div className={styles.trainModelSubSection}>
            <ModelDetails styles={styles} modelStateControls={modelStateControls} />
            <ModelVisualizer styles={styles}  modelState={modelStateControls.modelState} />
        </div>
    </section>
  )
}
