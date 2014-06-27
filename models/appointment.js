var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  title: { type: String, required: 'Appointment description is required' },
  user: {
    id: { type: String, required: true },
    displayName: String
  },
  dateAndTime: { type: Date, required: true },
  endDateAndTime: { type: Date, required: true },
  remarks: String
});

AppointmentSchema.virtual('duration')
  .get(function () {
    var durationMs = this.endDateAndTime - this.dateAndTime;
    if (durationMs) {
      return Math.round(((durationMs % 86400000) % 3600000) / 60000);
    }
    else {
      return;
    }
  });

AppointmentSchema.path('dateAndTime').validate(function (value, done) {
  var self = this;
  return mongoose.models.Appointment.find( { $or: [ 
    { dateAndTime: { $lt: self.endDateAndTime, $gte: self.dateAndTime } }, 
    { endDateAndTime: { $lte: self.endDateAndTime, $gt: self.dateAndTime } }
  ] }, function (err, appointments) {
    done(! appointments || appointments.length === 0);
  });
}, "The appointment overlaps with other appointments");

module.exports = mongoose.model('Appointment', AppointmentSchema);