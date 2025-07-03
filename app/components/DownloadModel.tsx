import {LayersModel, loadLayersModel} from '@tensorflow/tfjs';
import ShowInfoModal from '../types/ShowInfoModalTypes';

type DownloadModelProps = {
    styles : {readonly [key: string] : string},
    modelTrained:boolean,
    setShowInfoModal: React.Dispatch<React.SetStateAction<ShowInfoModal>>
}

export default function DownloadModel({styles, modelTrained, setShowInfoModal} : DownloadModelProps) {

    async function downloadModel() {
        try {
            const model:LayersModel = await loadLayersModel("localstorage://model");
            model.save("downloads://model")      
        } catch (error) {
            setShowInfoModal({visibility: true, message: "Model Downloading Error", description: "Some Error Occured while trying to download the auto-saved model!", type:'error'})
            console.log(error)  // For Developers
        }
    }

    return (
    <section className={styles.downloadModel}>
    <h1>Download Trained Model</h1>
    <h3 className={modelTrained ? styles.modelDownloadInfoActive : styles.modelDownloadInfoInActive}>{!modelTrained ? `Model not trained! Train Model first to download model`: `Model Trained! Click the button below to download the model`}</h3>
    <button type="button" className={styles.downloadButton} disabled={!modelTrained} onClick={e => {e.stopPropagation(); downloadModel()}}>Download Model</button>
    </section>
    )
}