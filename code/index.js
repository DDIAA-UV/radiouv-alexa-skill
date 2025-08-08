const Alexa = require('ask-sdk-core');


const APL_DIRECTIVE = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "radio-uv-stream",
    "document": {
        "src": "doc://alexa/apl/documents/radiouv-response",
        "type": "Link"
    },
    "datasources": {
        "audioPlayerTemplateData": {
            "type": "object",
            "properties": {
                "audioControlType": "none",
                "audioSources": [],
                "backgroundImage": "https://github.com/r-jahir/Radiouv-images/blob/main/background/Grupo%2077.jpg?raw=true",
                "coverImageSource": "",
                "headerTitle": "UNIVERSIDAD VERACRUZANA",
                "logoUrl": "https://github.com/RubenRiveraMorales/radio-resources/blob/main/background/uv_background.jpg?raw=true",
                "primaryText": "",
                "secondaryText": "",
                "sliderType": "indeterminate"
            }
        }
    }
};

const STREAMS = [
  {
    'token': 'radio-uv-stream',
    'url': 'https://58fe359775f31.streamlock.net/radioice/radioice.stream/playlist.m3u8',
    'metadata': {
      'title': 'Radio UV',
      'subtitle': 'Transmitiendo en vivo desde la Universidad Veracruzana',
      'art': {
        'sources': [
          {
            'contentDescription': 'Radio UV',
            'url': 'https://github.com/r-jahir/Radiouv-images/blob/main/background/Grupo%2077.jpg?raw=true',
            'widthPixels': 512,
            'heightPixels': 512,
          },
        ],
      },
      'backgroundImage': {
        'sources': [
          {
            'contentDescription': 'Radio UV-Fondo',
            'url': 'https://github.com/r-jahir/Radiouv-images/blob/main/background/Grupo%2093.jpg?raw=true',
            'widthPixels': 1200,
            'heightPixels': 800,
          },
        ],
      },
    },
  },
];

const PlayStreamIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
            (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                (handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent' ||
                    handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'));
    },
  handle(handlerInput) {
    const stream = STREAMS[0];
    console.log('Iniciando reproducción. Metadata:', JSON.stringify(stream.metadata));

    const responseBuilder = handlerInput.responseBuilder
      .speak('Reproduciendo Radio UV.')
      .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);


    if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
      responseBuilder.addDirective(APL_DIRECTIVE);
      console.log('Directiva APL enviada');
    } else {
      console.log('El dispositivo no soporta APL');
    }

    return responseBuilder.getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
           handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Esto es Radio UV, una skill para escuchar la transmisión de la Universidad Veracruzana. Di "reproduce Radio UV" para empezar, "pausa" para pausar, "reanuda" para continuar, o "alto" para detener.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
           (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .speak('Deteniendo Radio UV.')
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued' ||
           handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
     console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Lo siento, hubo un problema. Por favor, intenta de nuevo.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    HelpIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();