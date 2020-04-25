const loggingClient = require('@google-cloud/logging');

// start cloud function

exports.deviceLog = (data, context) => {

    const projectId=data.attributes.projectId;
    const logging = new loggingClient({
        projectId: process.env.projectId,
    });
    const log = logging.log('device-logs');
    const metadata = {
      // Set the Cloud IoT Device you are writing a log for
      // you extract the required device info from the PubSub attributes
      resource: {
        type: 'cloudiot_device',
        labels: {
          project_id: data.attributes.projectId,
          device_num_id: data.attributes.deviceNumId,
          device_registry_id: data.attributes.deviceRegistryId,
          location: data.attributes.deviceRegistrylocation,
        }
      },
      labels: {
        // note device_id is not part of the monitored resource, but you can
        // include it as another log label
        device_id: data.attributes.deviceId,
      }
    };
    const logData = JSON.parse(Buffer.from(data.data, 'base64').toString());

    const temperature = 'temperature:'+logData.temperature;
    const deviceId = 'deviceId:'+logData.device;

    // write the log entry to Stackdriver Logging
    const entry = log.entry(metadata, deviceId+','+temperature);
   log
  .write(entry)
  .then(() => {
    console.log(`Logged: ${temperature}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
 };
