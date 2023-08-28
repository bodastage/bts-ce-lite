{
  "targets": [
    {
      "target_name": "telecomparser",
      "sources": [
        "src/telecomparser.cpp",
        "src/bodabulkcmparser.cpp",
        "src/bodahuaweimmlparser.cpp",
        "src/bodautils.cpp",
        "src/bodabulkcmparser.h",
        "src/bodahuaweimmlparser.h",
        "src/bodautils.h",
      ],
      'include_dirs': ["<!@(node -p \"require('node-addon-api').include\")", "external"],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'cflags!': [ '-fno-exceptions', '-std=c++17', '-frtti' ],
      'cflags_cc!': [ '-fno-exceptions', '-std=c++17', '-frtti' ],
      'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.15',
        "OTHER_CFLAGS": [ "-std=c++17", "-frtti"],
		"CLANG_CXX_LANGUAGE_STANDARD":"c++17"
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 
			    'ExceptionHandling': 1,
			    "AdditionalOptions": [ "-std:c++17", ],
          "RuntimeTypeInfo": "true",
		    },
		
      },
	  "msbuild_settings": {
		"ClCompile": {
			"LanguageStandard": "stdcpp17"
		}
	  }
    }
  ]
} 