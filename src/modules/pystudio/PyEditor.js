import React from 'react'
import AceEditor from 'react-ace';
import { FormGroup, InputGroup, Button, TextArea, Intent, Spinner,
    Callout, Menu, MenuItem, ProgressBar, HTMLSelect , Popover, Position, Icon
} from "@blueprintjs/core";


const PyEditor = () => {

    const [code, setCode] = React.useState('import btslite_api;');
    const [result, setResult] = React.useState(null);


    const submitCode = async () => {
        const _result = await btslite_api.submitCode({ 
            code,
            lang: 'python'
        });

        //console.log("_result:", _result);
        setResult(_result);
    }

    return <>
    <AceEditor 
        onChange={setCode}
        value={code}
        mode="python"
        theme="github"
        defaultValue='import btslite_api;'
    />
    <Button onClick={() => submitCode()} text="Run"/>

    {result && result.status === 'error' ? <Callout intent={Intent.DANGER} title="Error" icon="warning-sign">
        <code>{JSON.stringify(result.message.message)}</code> </Callout>:null}

    {result && result.status === 'success' ? <Callout title="Result" icon="tick-circle">{result?.message?.stdout}</Callout>:null}

    </>
    ;
}


export default PyEditor;