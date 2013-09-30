'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    startserver: {
    	options: {
    		configJson: grunt.file.readJSON('www/commonapp/config.json')
    	}
    }
  });

  //Developer tasks
  grunt.registerTask('devserver', 'Start dev server for speedy refresh of web resources', function () {
  	  	grunt.util.spawn({
      	cmd: 'node',
      	args: ['./dev_server/app.js']
   		 },grunt.task.current.async());  
  });
  
  grunt.registerTask('chrome','Start Chrome with web security disabled',function(){
  	 grunt.util.spawn({
  	  	cmd : 'bash',
  	  	args: ['./build/start-chrome.sh']
  	  },grunt.task.current.async());
  });
  
  grunt.registerTask('stage', 'git add files before running the release task', function () {
	    var files = this.options().files;
	    grunt.util.spawn({
	      cmd: process.platform === 'win32' ? 'git.cmd' : 'git',
	      args: ['add'].concat(files)
	    }, grunt.task.current.async());
  });
  
  //Admin tasks
  grunt.registerTask('setup-worklight', ['createWLDB','buildWAR','deployWAR']);
  grunt.registerTask('build-app', ['copyFiles','buildwlapp']);
  grunt.registerTask('deploy-app', ['deploywlapp']);
  grunt.registerTask('build-adapters', ['buildAdapters']);
  grunt.registerTask('deploy-adapters', ['deployAdapters']);
  
  
  
  //Private tasks below
  grunt.registerTask('copyFiles','Build optimized Dojo and copy those files to Worklight app',function(){
  	 grunt.util.spawn({
  	  	cmd : 'ant',
  	  	args: ['copyFiles','-f','./build/build.xml']
  	  },grunt.task.current.async());
  });
  
  grunt.registerTask('buildwlapp','Build Worklight app .wlapp file',function(){
  	 grunt.util.spawn({
  	  	cmd : 'ant',
  	  	args: ['buildwlapp','-f','./build/build.xml']
  	  },grunt.task.current.async());
  });
  
  grunt.registerTask('deploywlapp','Deploy Worklight app .wlapp file',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['deploywlapp','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('buildAdapters','Build Worklight adapters',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['buildAdapters','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('deployAdapters','Deploy Worklight adapters',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['deployAdapters','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('buildWAR','Build Worklight WAR',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['buildWAR','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('deployWAR','Deploy Worklight WAR',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['deployWAR','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('createWLDB','Create WL DB',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['createWLDB','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });
  
  grunt.registerTask('makeDocs','Create API docs',function(){
	  	 grunt.util.spawn({
	  	  	cmd : 'ant',
	  	  	args: ['generateAPIDocs','-f','./build/build.xml']
	  	  },grunt.task.current.async());
	  });

};