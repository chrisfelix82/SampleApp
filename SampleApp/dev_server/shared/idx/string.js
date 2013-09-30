/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","dojo/string"], function (dLang,iMain,dString)
{
    /**
 	 * @name idx.string
 	 * @namespace Provides Javascript utility methods in addition to those provided by Dojo.
 	 */
	var iString = dLang.getObject("string", true, iMain);
	
	/**
	 * @public 
	 * @function
	 * @name idx.string.startsWith
	 * @description Checks if the specified text starts with the specified prefix.
	 * @param {String} text The text to look at.
	 * @param {String} prefix The prefix to check for.
	 * @returns {Boolean} Return true if string "text" starts with "prefix"
	 */
	iString.startsWith = function(/*string*/ text, /*string*/ prefix){
		return (dLang.isString(text) && dLang.isString(prefix) && text.indexOf(prefix) === 0); // Boolean
	};
	
	/**
	 * @public 
	 * @function
	 * @name idx.string.endsWith
	 * @description Checks if the specified text ends with the specified suffix.
	 * @param {String} text The text to look at.
	 * @param {String} suffix The suffix to check for.
	 * @returns {Boolean} Return true if string "text" ends with "suffix"
	 */
	iString.endsWith = function(/*string*/ text, /*string*/ suffix){
		return (dLang.isString(text) && dLang.isString(suffix) && text.indexOf(suffix) === text.length - suffix.length); // Boolean
	};

	/**	
	 * @public 
	 * @function
	 * @name idx.string.equalsIgnoreCase
	 * @description Case insensitive check for string equality.
	 * @param {String} s1 The first string.
	 * @param {String} s2 The second string.
	 * @returns {Boolean} Return true if string "s1" equals to "s2" with ignoring case
	 */
	iString.equalsIgnoreCase = function(/*string*/ s1, /*string*/ s2){
		return (dLang.isString(s1) && dLang.isString(s2) && s1.toLowerCase() === s2.toLowerCase()); // Boolean
	};
	
	/**	
	 * @public 
	 * @function
	 * @name idx.string.isNumber
	 * @description Checks if the specified parameter is a number and is finite.
	 * @param {Number} n The value to check.
	 * @returns {Boolean} Return true if 'n' is a Number
	 */
	iString.isNumber = function(/*number*/ n){
		return (typeof n == "number" && isFinite(n)); // Boolean
	};
	
	/**
	 * @public 
	 * @function
	 * @name idx.string.nullTrim
	 * @description Trims the specified string, and if it is empty after trimming, returns null.  
	 *              If the specified parameter is null or undefined, then null is returned.
	 * @param {String} str the string to trim
	 * @returns {String} Trimmed string or null if nothing left
	 */
    iString.nullTrim = function(/*String*/ str) {
            if (! str) return null;
            var result = dString.trim(str);
            return (result.length == 0) ? null : result;
        };
        
     /**
	 * @public 
	 * @function
	 * @name idx.string.propToLabel
	 * @description Converts a property name that is typically separated by camel case into a
	 *              psuedo label (i.e.: one that is not translated but based off the property
	 *              name but formatted nicer).  This method converts dots/periods into slashes. 
	 * @param {String} propName The property name to convert.
	 * @returns {String} The converted psuedo-label.
      *
      */
     iString.propToLabel = function(/*String*/ propName) {
     	if (!propName) return propName;
     	
	    // split the property name at any case switches or underscores
	    propName = dString.trim(propName);
	    var upperProp = propName.toUpperCase();
	    var lowerProp = propName.toLowerCase();
	    var index = 0;
	    var result = "";
	    var prevResult = "";
	    var prevUpper = false;
	    var prevLower = false;

		for (index = 0; index < propName.length; index++) {
	    	var upperChar = upperProp.charAt(index);
	        var lowerChar = lowerProp.charAt(index);
	        var origChar  = propName.charAt(index);

	        var upper = ((upperChar == origChar) && (lowerChar != origChar));
	        var lower = ((lowerChar == origChar) && (upperChar != origChar));

	        // check for spaces or underscores
	        if ((origChar == "_") || (origChar == " ")) {
	        	if (prevResult == " ") continue;
	         	prevResult = " ";
	            prevUpper  = upper;
	            prevLower  = lower;
	            result = result + prevResult;
	            continue;
	        }
	           
	        // check for dot notation
	        if (origChar == ".") {
	        	prevResult = "/";
	        	prevUpper = upper;
	        	prevLower = lower;
	        	result = result + " " + prevResult + " ";
	        	continue;
	        }

	        // check if this is the first character
	        if ((index == 0) || (prevResult == " ")) {
	        	prevResult = upperChar; 
	            prevUpper  = upper;
	            prevLower  = lower;
	            result = result + prevResult;
	            continue;
	        }

	        if ((!upper) && (!lower)) {
	        	if (prevUpper || prevLower) {
	            	result = result + " ";
	            }

	            // the character is not alphabetic, and neither is this one
	            prevUpper = upper;
	            prevLower = lower;
	            prevResult = origChar;

	            result = result + prevResult;
	            continue;
	        }

	        if ((!prevUpper) && (!prevLower)) {
	        	// previous character was non-alpha, but this one is alpha
	        	var prevSlash = (prevResult == "/");
	            prevUpper = upper;
	            prevLower = lower;
	            prevResult = upperChar;
	            if (prevSlash) {
	            	result = result + prevResult;
	            } else {
	            	result = result + " " + prevResult;
	            }
	            continue;
	        }

	        // if we get here then both the previous and current character are
	        // alphabetic characters so we need to detect shifts in case
	        if (upper && prevLower) {
	        	// we have switched cases
	            prevResult = upperChar;
	            prevUpper  = upper;
	            prevLower = lower;
	            result = result + " " + prevResult;
	            continue;
	        }

	        // if we get here then we simply use the lower-case version
	        prevResult = lowerChar;
	        prevUpper  = upper;
	        prevLower  = lower;
	        result = result + prevResult;
	 	}
	    
	    // return the result
	    return result;        
     };
     
     return iString;
});
