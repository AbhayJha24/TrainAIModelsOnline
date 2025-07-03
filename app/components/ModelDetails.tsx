import {ModelState,ModelAction} from '../types/ModelStateControlTypes';

type ModelDetailsProps = {
    styles: {readonly [key:string]:string},
    modelStateControls:{
        modelState:ModelState,
      modelDispatcher: React.ActionDispatch<[action: ModelAction]>
    }
}

export default function ModelDetails({styles, modelStateControls}: ModelDetailsProps) {
    

    return(
    <form className={styles.modelDetailsForm}>
        
        <div className={styles.inputLayer}>
            {
                modelStateControls.modelState.layers.map((layer, idx)=>{
                    return (
                    <div className={styles.layer} key={idx}>
                        <label>Size of Layer :</label>
                        <div className={styles.incDecButtonsHolder}>
                            <button type="button" className={styles.incDecButton} onClick={()=>{modelStateControls.modelDispatcher({type:"dec_units", payload:{index:idx}})}}>-</button>
                            <p>{layer.units}</p>
                            <button type="button" className={styles.incDecButton} onClick={()=>{modelStateControls.modelDispatcher({type:"inc_units", payload:{index:idx}})}}>+</button>
                        </div>
                        <label>Activation Function :</label>
                        <div className={styles.incDecButtonsHolder}>
                            <select value={layer.activationFunction} onChange={e=> modelStateControls.modelDispatcher({type:"change_activation", payload:{index:idx, value:e.target.value}})}>
                                <option value="elu">Elu</option>
                                <option value="gelu">Gelu</option>
                                <option value="gelu_new">Gelu New</option>
                                <option value="hardSigmoid">Hard Sigmoid</option>
                                <option value="linear">Linear</option>
                                <option value="mish">Mish</option>
                                <option value="relu">Relu</option>
                                <option value="relu6">Relu6</option>
                                <option value="selu">Selu</option>
                                <option value="sigmoid">Sigmoid</option>
                                <option value="softmax">Softmax</option>
                                <option value="softplus">Softplus</option>
                                <option value="softsign">Softsign</option>
                                <option value="swish">Swish</option>
                                <option value="tanh">Tanh</option>
                            </select>
                        </div>
                    </div>
                    )
                })
            }
        </div>
    </form>
    )
}