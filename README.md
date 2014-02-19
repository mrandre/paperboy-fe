paperboy-fe
===========

This is Paperboy's new front end. 

Build:

    grunt    <--- start a concatenated and uglified build with the default version of 'dev'
    grunt --ver 12.7.1   <-- start a concatenated and uglified build with a version of '12.7.1'
    
Development:

    grunt dev <-- start a quick non-concatenated and non-uglified build for development
    grunt watch <-- watch the working dirs and kick off `grunt dev` if any files change
    grunt connect:keepalive <-- start a static node server at localhost:8080 
