/**
 * Created by gvc1 on 02-09-2014.
 */

exports = module.exports = {
    validateRequired:function(fieldName,workflow,req,errorMessage){
        errorMessage = this.getOptionalParamValue(errorMessage,"required");
        this.checkErrorCondition(!req.body[fieldName],fieldName,workflow,errorMessage);
    },

    validateLettersAndNumbers: function (fieldName,workflow,req,errorMessage) {
        errorMessage = this.getOptionalParamValue(errorMessage,"Only use letters and numbers");
        this.checkRegxCondition(/^[a-zA-Z0-9\-\_]+$/,fieldName,req,workflow,errorMessage);
    },

    validateEmail: function (fieldName,workflow,req,errorMessage) {
        errorMessage = this.getOptionalParamValue(errorMessage,'invalid email format');
        this.checkRegxCondition(/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/,fieldName,req,workflow,errorMessage);
    },

    getOptionalParamValue: function(optionalParam,defaultValue) {
        return (typeof optionalParam === "undefined") ? defaultValue : optionalParam;
    },

    checkErrorCondition : function (condition,fieldName,workflow,errorMessage) {
        if (!(workflow.outcome.errfor[fieldName]) && condition) {
            errorMessage = this.getOptionalParamValue(errorMessage);
            workflow.outcome.errfor[fieldName] = errorMessage;
        }
    },

    checkRegxCondition: function (regx,fieldName,req,workflow,errorMessage) {
        this.checkErrorCondition(!(regx.test(req.body[fieldName])) ,fieldName,workflow,errorMessage );
    }

};



