// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
//
//
'use-strict'
const functions = require('firebase-functions');
const admin = require('firebase-admin');
/*const credential = admin.credential.applicationDefault();*/
admin.initializeApp(functions.config().firebase);
exports.sendNotification = functions.database.ref('/Usuarios/{uploader_id}/Notifications/{solicitud_id}')
.onWrite(async (change, context) => {
	/* /{adopterid} const uploaderid = context.params.adopterid; 'Adopter:', adopterid, */
	const uploader_id = context.params.uploader_id;
	const solicitud_id = context.params.solicitud_id;

	console.log('Notifications:', solicitud_id , 'Uploader:', uploader_id);

	if (change.before.exists()){
		return null;
	}

	if (!change.after.exists()){
		return null;
	}

	const fromUser = admin.database().ref(`Usuarios/${uploader_id}/Notifications/${solicitud_id}/from_user_id`).once('value');

	return fromUser.then(fromUserResult => {
		const from_user_id = fromUserResult.val();
		console.log('Nueva solicitud de adopcion de: ', from_user_id, 'from', fromUserResult);

		const userQuery = admin.database().ref(`Usuarios/${from_user_id}/displayName`).once('value');
		const deviceToken = admin.database().ref(`/Usuarios/${uploader_id}/device_token`).once('value');



		return Promise.all([userQuery, deviceToken]).then(result => {
			const userName = result[0].val();
			const token_id = result[1].val();
			console.log("Device token", token_id, " from ", userName);
			const payload = {
				notification: {
					title : 'Nueva solicitud de adopcion',
					body : `${userName} le ha enviado una solicitud de adopcion`,
					icon : "default",
					click_action: "com.pity.appperros1.TARGETNOTIFICATION"
				},
				data : {
					from_user_id : from_user_id
				}
			};

			return admin.messaging().sendToDevice(token_id, payload).then(response => {
				console.log('Funcion de notificacion');
				return null;
			});
		});

	});

});