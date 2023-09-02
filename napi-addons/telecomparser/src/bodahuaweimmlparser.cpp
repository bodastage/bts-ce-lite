
/**

Copyright 2023 Bodastage Solutions Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
#include "bodahuaweimmlparser.h"
#include <iostream>
#include "fast-cpp-csv-parser/csv.h"
#include "spdlog/spdlog.h"
#include <regex>

namespace fs = std::filesystem;

bodastage::BodaHuaweiMMLParser::BodaHuaweiMMLParser()
{
}

void bodastage::BodaHuaweiMMLParser::set_extract_parameters_only(bool bl){
    extract_parameters_only = bl;
}
    
void bodastage::BodaHuaweiMMLParser::set_extract_meta_fields(bool bl){
    extract_meta_fields = bl;
}

    
    /**
     * The parser's entry point.
     * 
     * @param filename 
     */
void bodastage::BodaHuaweiMMLParser::parse_file( string input_filename ) {
    fstream mo_file;
    mo_file.open(input_filename, ios::in); 
    if (mo_file.is_open()) {
        string line;
            while (getline(mo_file, line)) { 
            process_line(line);
            }
    }
    mo_file.close(); 
}
       
/**
 * Set parameter file 
 * 
 * @param filename 
 */
void bodastage::BodaHuaweiMMLParser::set_parameter_file(string filename){
    parameter_file = filename;
}
    
    
 /**
 * @brief Extract parameter list from  parameter file
 * 
 * @param filename 
 */
void bodastage::BodaHuaweiMMLParser::get_parameters_to_extract(string filename){
    io::CSVReader<2, io::trim_chars<' ', '\t'>, io::no_quote_escape<':'>> in(filename);
    in.read_header(io::ignore_extra_column, "mo", "parameters");
    std::string mo; std::string parameters;

    while(in.read_row(mo, parameters)){
        // do stuff with the data
        std::vector<std::string> parameter_list = bodastage::split_str(parameters, ",");
        std::vector<std::string> parameter_stack;
        for (int i = 0; i < (int)parameter_list.size(); i++) {
            parameter_stack.push_back(parameter_list[i]);
        }

        class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo, parameter_stack));

        if(bodastage::ends_with(mo, "_ACT")){ 
            act_class_name_attrs_map.insert( 
                std::pair<string, std::vector<string>>( bodastage::str_replace(mo, "_ACT", ""), parameter_stack)
            );
            continue;
        }

        if(bodastage::ends_with(mo, "_BLK")){ 
            blk_class_name_attrs_map.insert(
                 std::pair<string, std::vector<string>>( bodastage::str_replace(mo, "_BLK", ""), parameter_stack )
            );
            continue;
        }
        
        if(bodastage::ends_with(mo, "_MOD")){ 
            mod_class_name_attrs_map.insert(
                std::pair<string, std::vector<string>>(bodastage::str_replace(mo, "_MOD", ""), parameter_stack)
            );
            continue;
        }
        
        if(bodastage::ends_with(mo, "_DEA")){ 
            dea_class_name_attrs_map.insert(
                std::pair<string, std::vector<string>>(bodastage::str_replace(mo, "_DEA", ""), parameter_stack)
            );
            continue;
        }
        
        if(bodastage::ends_with(mo, "_UBL")){ 
            ubl_class_name_attrs_map.insert(
                std::pair<string, std::vector<string>>(bodastage::str_replace(mo, "_UBL", ""), parameter_stack)
            );
            continue;
        }
        
        if(bodastage::ends_with(mo, "_UIN")){ 
            uin_class_name_attrs_map.insert(
                std::pair<string, std::vector<string>>(bodastage::str_replace(mo, "_UIN", ""), parameter_stack)
            );
            continue;
        }
    }

    
    //Move to the parameter value extraction stage
    parser_state = EXTRACTING_VALUES;
}
    
    
    /**
     * @brief Parser entry point 
     * 
     * 
     * @since 1.1.1
     */
void bodastage::BodaHuaweiMMLParser::parse() {
    //Extract parameters
    if (parser_state == EXTRACTING_PARAMETERS) {
        process_file_or_directory();

        parser_state = EXTRACTING_VALUES;
    }
        
    //Reset line count
    line_number = 0;
                
    //Extracting values
    if (parser_state == EXTRACTING_VALUES) {
        process_file_or_directory();
        parser_state = EXTRACTING_DONE;
    }
    

    //Close the print writers
    close_mo_pw_map();
}
    
/**
 * @brief Determines if the source data file is a regular file or a directory and 
 * parses it accordingly
 * 
 * @since 1.1.0
 * @version 1.0.0
 */
void bodastage::BodaHuaweiMMLParser::process_file_or_directory() {
    fs::path path(data_source); 
    bool is_regular_executable_file = bodastage::is_regular_file(path) && bodastage::file_is_readable(path);

    bool is_readable_directory = bodastage::is_directory(path)  && bodastage::file_is_readable(path);

   if (is_regular_executable_file) {
        set_file_name(data_source);

        base_file_name = bodastage::get_file_basename(data_file);
        if (parser_state == EXTRACTING_PARAMETERS) {
            spdlog::info("Extracting parameters from {}...", base_file_name );
        } else {
            spdlog::info("Parsing {} ...",  base_file_name);
        }

        //Parse file
        parse_file(data_source);

        if (parser_state == EXTRACTING_PARAMETERS) {
            spdlog::info("Done.");
        } else {
            spdlog::info("Done.");
        }
    }

    if (is_readable_directory) {

        //get all the files from a directory
        for (const auto & entry : fs::directory_iterator(path)){
            set_file_name(entry.path().string());

            try{
                base_file_name = bodastage::get_file_basename(data_file);
                if(parser_state == EXTRACTING_PARAMETERS){
                    spdlog::info("Extracting parameters from {}...", base_file_name );
                }else{
                    spdlog::info("Parsing {} ...",  base_file_name);
                }

                parse_file(entry.path().string());

                if(parser_state == EXTRACTING_PARAMETERS){
                    spdlog::info("Done.");
                }else{
                    spdlog::info("Done.");
                }
            }catch(std::exception e){
                spdlog::error(e.what());
                spdlog::warn("Skipping file: {} \n", base_file_name);
            }
        }
    }

}

void bodastage::BodaHuaweiMMLParser::process_line(string line){
    ++line_number;
    
    if(bodastage::starts_with(line,"//Export start time:")){
        std::vector<std::string> s_array = bodastage::split_str(line, "time:");
        date_time =  bodastage::trim_str(s_array[1]);
        return;
    }
   
    
    //Extract the version
    if(bodastage::starts_with(line, "//For BAM version:")){
        std::vector<std::string> s_array = bodastage::split_str(line, ":");
        version = bodastage::trim_str(s_array[1]);
        return;
    }
    
    //Extract the IP
    if(bodastage::starts_with(line, "//OMU IP:")){
        std::vector<std::string> s_array = bodastage::split_str(line, ":");
        IP = bodastage::trim_str(s_array[1]);
        return;
    }
    
    //Extract the BSCID
    if(bodastage::starts_with(line, "//System BSCID:")){
        std::vector<std::string> s_array = bodastage::split_str(line, ":");
        bsc_id = bodastage::trim_str(s_array[1]);
        return;
    }
    
    //Extract the MBSC Mode
    if(bodastage::starts_with(line, "//MBSC Mode:")){
        std::vector<std::string> s_array = bodastage::split_str(line, ":");
        mbsc_mode = bodastage::trim_str(s_array[1]);
        return;
    }
    
    //System.out.println(line);
    //Handle lines tarting with SET
    if(bodastage::starts_with(line, "SET ") || bodastage::starts_with(line, "ADD ") ){

        std::vector<std::string> line_array = bodastage::split_str(line, ":");
        string mo_part = line_array[0];
        string param_part = line_array[1];

        //Get the MO
        std::vector<std::string> mo_part_array = bodastage::split_str(mo_part, " ");
        string mo_name = bodastage::trim_str(mo_part_array[1]);

        class_name = mo_name;
        
        //Parameter Extraction Stage
        if(EXTRACTING_PARAMETERS == parser_state){
            if( !parameter_file.empty() && class_name_attrs_map.count(class_name) ==0 ){
                attr_value_map.clear();
                return;
            }
            
            std::vector<string> attr_stack;
            
            if(class_name_attrs_map.count(mo_name)){ //this.className
                    attr_stack = class_name_attrs_map.at(mo_name);
            }

            //Get the parameters
            //(?<=[^=]+=[^=]+),\s(?=[^=^"]+=[^=]+) --
            //(?<=[^=]+),\\s(?=[^=^\"]+=[^=]+)
            std::vector<std::string> param_part_array = bodastage::preg_split(param_part, "(?=[^=]+=[^=]+),\\s(?=[^=^]+=[^=]+)");

            for(int i = 0, len = (int)param_part_array.size(); i < len; i++){
                std::vector<string> s_array = bodastage::split_str(param_part_array[i], "=");
                string param_name = bodastage::trim_str(s_array[0]);
                
                //Skip if the parameter is not in the pFile
                if( !bodastage::value_in_vector(attr_stack, param_name) && !parameter_file.empty()){
                    continue;
                }
                
                if( !bodastage::value_in_vector(attr_stack, param_name) ){
                    attr_stack.push_back(param_name);
                }
                
                //Collect multivalue parameters 
                //Skip/ignore parameters that end with NAME such GSMCELLNAME. The reason for this is 
                //when there is hypen the parser was mistakenly treating the parameter has multivalued
                string temp_value  = bodastage::trim_str(s_array[1]);
                if(bodastage::preg_match(temp_value, "([^-]+-[^-]+&).*") && !bodastage::ends_with(param_name, "NAME")){
                        string mv_parameter = class_name + "_" + param_name;

                        std::vector<string> children;
                        if(parameter_child_map.count(mv_parameter)){ 
                            children = parameter_child_map.at(mv_parameter);
                        }else{
                            parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, std::vector<string>()));
                        }

                        std::vector<string> value_array = bodastage::split_str(temp_value, "&");

                        for(int j = 0; j < (int)value_array.size(); j++){
                            string v = value_array[j];
                            std::vector<string> v_array = bodastage::split_str(v, "-");
                            string child_parameter = v_array[0];
                            if( ! bodastage::value_in_vector(children, child_parameter)){
                                children.push_back(child_parameter);
                            }   
                        }
                        
                        parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, children));
                    }
                    //EOF: MV Parameters

            }
            
            class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
            attr_value_map.clear();
            return; //Stop here if we on the parameter extraction stage
        }
        
        if(EXTRACTING_VALUES == parser_state){

            //Get the parameters
            //string [] paramPartArray = paramPart.split("(?<=[^=]+=[^=]+),\\s(?=[^=^\"]+=[^=]+)");
            // std::vector<string> param_part_array = bodastage::preg_split(param_part, "(?<=[^=]+\"),\\s(?=[^=^\"]+=[^=]+)");
            std::vector<string> param_part_array = bodastage::preg_split(param_part, "(?=[^=]+=[^=]+),\\s(?=[^=^]+=[^=]+)");

            for(int i = 0, len = (int)param_part_array.size(); i < len; i++){
                std::vector<string> s_array = bodastage::split_str(param_part_array[i], "=");
                string param_name = bodastage::trim_str(s_array[0]);
                string param_value = bodastage::preg_replace(s_array[1], "^\"|\"$|;$|\";$", ""); //remove the double quotes at the start and end of the values

                attr_value_map.insert(std::pair<string, string>(param_name, param_value));
            }   
        }
        
        //Continue to value extraction stage
        if(!parameter_file.empty() && class_name_attrs_map.count(class_name) == 0 ){
                attr_value_map.clear();
            return;
        }

        //Add headers
        //If there is no parameterFile or if the parameter file exists and the mo is in the classNameAttrsMap
        if( moi_print_writers.count(class_name) == 0 ) {
            string moi_file = output_directory + bodastage::get_sep() + class_name + ".csv";
            moi_print_writers.insert(std::pair<string, ofstream>(class_name, ofstream(moi_file)));
            
            string p_name_str = "FILENAME,DATETIME,BSCID,BAM_VERSION,OMU_IP,MBSC MODE";

            //This list of parameters are added by default. Ignore to prevent duplicates
            //string ignoreList = "FileName,varDateTime,BSCID,BAM_VERSION,OMU_IP,MBSC MODE";
            std::vector<string> attr_stack =class_name_attrs_map.at(class_name);

            for(int y =0; y < (int)attr_stack.size(); y++){
                string p_name = attr_stack.at(y);
                
                //@TODO: Skip parameter that are added by default
                if( p_name == "filename" || 
                    p_name == "datetime" || 
                    p_name == "bscid" || 
                    p_name == "bam_version" ||
                    p_name == "omu_ip" || 
                    p_name == "mbsc mode" ) continue;
                //if(ignoreList.contains(p_name)) continue;
                
                string mv_parameter = mo_name + "_" + p_name;
                
                //Handle multivalued parameter (parameters with children)
                if( parameter_child_map.count(mv_parameter)){
                    //Get the child parameters 
                    std::vector<string> child_parameters = parameter_child_map.at(mv_parameter);
                    for(int idx =0; idx < (int)child_parameters.size(); idx++){
                        string child_param = child_parameters.at(idx);
                        p_name_str = p_name_str + "," + p_name + "_" + child_param;
                    }
                    continue;
                }

                p_name_str = p_name_str + "," + p_name;
            }

            //Initialize the MO parameter map hash map
            //classNameAttrsMap.put(mo_name,attrStack);
            moi_print_writers.at(class_name) << p_name_str << '\n';
        }
        
        string p_value_str = base_file_name + "," + date_time + "," + bsc_id + "," + version + "," + IP + "," + mbsc_mode;
        
        //Add the parameter values 
        std::vector<string> attr_stack;
        attr_stack = class_name_attrs_map.at(mo_name);

        for(int it = 0; it < (int)attr_stack.size(); it++){
            string p_name = attr_stack[it];
            
            //@TODO: Skip parameter that are added by default
            if( bodastage::tolower(p_name)  == "filename" || 
                bodastage::tolower(p_name)  == "datetime" || 
                bodastage::tolower(p_name)  == "bscid" || 
                bodastage::tolower(p_name)  == "bam_version" ||
                bodastage::tolower(p_name)  == "omu_ip" || 
                bodastage::tolower(p_name)  == "mbsc mode" ) continue;

            string mv_parameter = mo_name + "_" + p_name;
            
            string p_value = "";
        
            if( parameter_child_map.count(mv_parameter)){
                
                //Fix for bug where parser can't tell if parametr is multivalued or not
                //ADD CLKSRC:SRCGRD=1, SRCT=LINE1_8KHZ;
                //ADD CLKSRC:SRCGRD=2, SRCT=BITS1-2MHZ;
                
                ///if(!attr_value_map.containsKey(p_name)){
                //    pValueStr += ",";
                //    continue;
                //}
                
                string temp_value = "";
                std::vector<string> value_array;
                if(attr_value_map.count(p_name)){
                    temp_value = attr_value_map.at(p_name);
                        value_array = bodastage::split_str(temp_value, "&");
                }

                std::map<string, string> param_value_map ;

                //Iterate over the values in parameterChildMap
                for(int j = 0; j < (int)value_array.size(); j++){
                    string v = value_array[j];
                    std::vector<string> v_array = bodastage::split_str(v, "-");
                    param_value_map.insert(std::pair<string, string>(v_array[0], v_array[1]));
                }

                //Get the child parameters 
                std::vector<string> child_parameters = parameter_child_map.at(mv_parameter);
                for(int idx =0; idx < (int)child_parameters.size(); idx++){
                    string child_param = child_parameters.at(idx);

                    if(param_value_map.count(child_param)){
                        string mv_value = bodastage::to_csv_format(param_value_map.at(child_param));
                        p_value_str = p_value_str + "," + mv_value;
                    }else{
                        p_value_str += ",";
                    }

                }

                continue;
            }
            
            if(attr_value_map.count(p_name)) { 
                p_value = attr_value_map.at(p_name);
            }
            p_value_str += ","+ bodastage::to_csv_format(p_value);
        }
        
        moi_print_writers.at(class_name) << p_value_str << endl;
        attr_value_map.clear();
    }//eof:SET
    
    
    //ACT
    if(bodastage::starts_with(line, "ACT ") ){
        extact_parameter_and_values(line, "ACT");
        return;
    }

    //ACT
    if(bodastage::starts_with(line, "MOD ")){
        extact_parameter_and_values(line, "MOD");
        return;
    }

    //ACT
    if(bodastage::starts_with(line, "DEA ") ){
        extact_parameter_and_values(line, "DEA");
        return;
    }

    //ACT
    if(bodastage::starts_with(line, "BLK ") ){
        extact_parameter_and_values(line, "BLK");
        return;
    }

    //ACT
    if(bodastage::starts_with(line, "UBL ") ){
        extact_parameter_and_values(line, "UBL");
        return;
    }

    //ACT
    if(bodastage::starts_with(line, "UIN ") ){
        extact_parameter_and_values(line, "UIN");
        return;
    }
    
    //
}


/**
 * 
 * @param line
 * @param key_word ACT,BLK,UBK,DEA,UIN
 */
void bodastage::BodaHuaweiMMLParser::extact_parameter_and_values(string line, string key_word) {
        if( !bodastage::str_contains(key_word, "ACT") && !bodastage::str_contains(key_word, "BLK") &&
                !bodastage::str_contains(key_word, "MOD") && !bodastage::str_contains(key_word, "DEA") &&
                !bodastage::str_contains(key_word, "UBL") &&  !bodastage::str_contains(key_word, "UIN")
                ){
            return;
        }
        std::vector<string> line_array = bodastage::split_str(line, ":");
        string mo_part = line_array[0];
        string param_part = line_array[1];


        //Get the MO
        std::vector<string> mo_part_array = bodastage::split_str(mo_part, " ");
        string mo_name = bodastage::trim_str(mo_part_array[1]);
        
        class_name = mo_name;
        
        string print_writer_class_name = class_name + "_" + key_word;
        
        //Parameter Extraction Stage
        if(EXTRACTING_PARAMETERS == parser_state){
            
            if( !parameter_file.empty() && class_name_attrs_map.count(print_writer_class_name) == 0 ){
                attr_value_map.clear();
                return;
            }
            
            std::vector<string> attr_stack;
            
            //Get the parameters
            //string [] paramPartArray = paramPart.split(", ");
            std::vector<string> param_part_array = bodastage::preg_split(param_part, "(?<=[^=]+),\\s(?=[^=^\"]+=[^=]+)");
            for(int i = 0, len = (int)param_part_array.size(); i < len; i++){
                std::vector<string> s_array = bodastage::split_str(param_part_array[i], "=");
                string param_name = bodastage::trim_str(s_array[0]);
                
                //Skip if the parameter is not in the pFile
                if( !bodastage::value_in_vector(attr_stack, param_name) && !parameter_file.empty() ){
                    continue;
                }
                
                if( !bodastage::value_in_vector(attr_stack, param_name)){
                    attr_stack.push_back(param_name);
                }
                
                //Collect multivalue parameters 
                //Skip/ignore parameters that end with NAME such GSMCELLNAME. The reason for this is 
                //when there is hypen the parser was mistakenly treating the parameter has multivalued
                string temp_value  = bodastage::trim_str(s_array[1]);
                if(bodastage::preg_match(temp_value, "([^-]+-[^-]+&).*") && !bodastage::ends_with(param_name, "NAME")){
                    string mv_parameter = class_name + "_" + param_name;
                    
                    std::vector<string> children;
                    if(parameter_child_map.count(mv_parameter)){ 
                        children = parameter_child_map.at(mv_parameter);
                    }else{
                        parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, std::vector<string>()));
                    }
                    
                    
                    std::vector<string> value_array = bodastage::split_str(temp_value, "&");
                    
                    for(int j = 0; j < (int)value_array.size(); j++){
                        string v = value_array[j];
                        std::vector<string> v_array = bodastage::split_str(v, "-");
                        string child_parameter = v_array[0];
                        children.push_back(child_parameter);
                    }
                    parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, children));
                }
            }
        
            if(parameter_file.empty()){
                if(key_word == "ACT"){
                    act_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
                if(key_word == "BLK"){
                    blk_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
                if(key_word == "MOD"){
                    mod_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
                if(key_word == "DEA"){
                    dea_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
                if(key_word == "UBL"){
                    ubl_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
                if(key_word == "UIN"){
                    uin_class_name_attrs_map.insert(std::pair<string, std::vector<string>>(mo_name,attr_stack));
                }
            }
            
            return; //Stop here if we on the parameter extraction stage
        }
        
        if(EXTRACTING_VALUES == parser_state){
            //Get the parameters
            std::vector<string> param_part_array = bodastage::split_str(param_part, ", ");
            for(int i = 0, len = (int)param_part_array.size(); i < len; i++){
                std::vector<string> s_array = bodastage::split_str(param_part_array[i], "=");
                string param_name = bodastage::trim_str(s_array[0]);
                string param_value = bodastage::preg_replace(s_array[1], ";$", "");

                attr_value_map.insert(std::pair<string, string>(param_name, param_value));
            }
            
        }
        
        //Continue to value extraction stage
        //printWriterClassName=className_<MOD}|BLK|...>
        if(!parameter_file.empty() && !class_name_attrs_map.count(print_writer_class_name) ){
                attr_value_map.clear();
            return;
        }
        
        //Add headers
        if(!moi_print_writers.count(print_writer_class_name)){
            string moi_file = output_directory + bodastage::get_sep() + print_writer_class_name + ".csv";
            moi_print_writers.insert(std::pair<string, ofstream>(print_writer_class_name, ofstream(moi_file)));
            
            string p_name_str = "FILENAME,DATETIME,BSCID,BAM_VERSION,OMU_IP,MBSC MODE";
            
            std::vector<string> attr_stack;
            
            if( parameter_file.empty() ){
                std::map<string, string>::iterator iter;
                for(iter = attr_value_map.begin(); iter != attr_value_map.end(); iter++){
                    string p_name = iter->first;
                    attr_stack.push_back(p_name);

                    //Handle multivalued parameter or parameters with children
                    //Skip/ignore parameters that end with NAME such GSMCELLNAME. The reason for this is 
                    //when there is hypen the parser was mistakenly treating the parameter has multivalued
                    string temp_value = attr_value_map.at(p_name);
                    if(bodastage::preg_match(temp_value, "([^-]+-[^-]+&).*") && !bodastage::ends_with(p_name, "NAME")){
                        string mv_parameter = class_name + "_" + p_name;
                        parameter_child_map.insert(std::pair<string, std::vector<string>>(mv_parameter, std::vector<string>()));
                        std::vector<string> children ;


                        std::vector<string> value_array = bodastage::split_str(temp_value, "&");

                        for(int j = 0; j < (int)value_array.size(); j++){
                            string v = value_array[j];
                            std::vector<string> v_array = bodastage::split_str(v, "-");
                            string child_parameter = v_array[0];
                            p_name_str = p_name_str + "," + p_name + "_" + child_parameter;
                            children.push_back(child_parameter);
                        }
                        parameter_child_map[mv_parameter] = children;

                        continue;
                    }

                    p_name_str = p_name_str + "," + iter->first;
                }
            
            }else{
                
                //Cases where the parameter list is provided in the parameter file
                attr_stack = class_name_attrs_map.at(print_writer_class_name);
                
                for(int y =0; y < (int)attr_stack.size(); y++){
                    string p_name = attr_stack.at(y);

                    //@TODO: Skip parameter that are added by default
                    if( bodastage::tolower(p_name) == "filename" || 
                        bodastage::tolower(p_name) == "datetime" || 
                        bodastage::tolower(p_name) == "bscid" || 
                        bodastage::tolower(p_name) == "bam_version" ||
                        bodastage::tolower(p_name) == "omu_ip" || 
                        bodastage::tolower(p_name) == "mbsc mode" ) continue;
                    //if(ignoreList.contains(p_name)) continue;

                    string mv_parameter = mo_name + "_" + p_name;

                    //Handle multivalued parameter (parameters with children)
                    if( parameter_child_map.count(mv_parameter)){
                        //Get the child parameters 
                        std::vector<string> child_parameters = parameter_child_map.at(mv_parameter);
                        for(int idx = 0; idx < (int)child_parameters.size(); idx++){
                            string child_param = child_parameters.at(idx);
                            p_name_str = p_name_str +","+ p_name + "_" + child_param;
                        }
                        continue;
                    }

                    p_name_str = p_name_str + "," + p_name;
                }
            }
            

            
            if( parameter_file.empty()){
                //Initialize the MO parameter map hash map
                if(key_word == "ACT"){
                    act_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
                if(key_word == "BLK"){
                    blk_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
                if(key_word == "MOD"){
                    mod_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
                if(key_word == "DEA"){
                    dea_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
                if(key_word == "UBL"){
                    ubl_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
                if(key_word == "UIN"){
                    uin_class_name_attrs_map.insert( std::pair<string, std::vector<string>>(mo_name, attr_stack));
                }
            }

            
            moi_print_writers.at(print_writer_class_name) << p_name_str << endl;
        }
        
        string p_value_str = base_file_name + "," + date_time + "," + bsc_id+ "," + version + "," + IP + 
                "," + mbsc_mode;
        
        //Add the parameter values 
        std::vector<string> attr_stack;

        if(key_word == "ACT"){
            attr_stack = act_class_name_attrs_map.at(mo_name);
        }
        if(key_word == "BLK"){
            attr_stack = blk_class_name_attrs_map.at(mo_name);
        }
        if(key_word == "MOD"){
            attr_stack = mod_class_name_attrs_map.at(mo_name);
        }
        if(key_word == "DEA"){
            attr_stack = dea_class_name_attrs_map.at(mo_name);
        }
        if(key_word == "UBL"){
            attr_stack = ubl_class_name_attrs_map.at(mo_name);
        }
        if(key_word == "UIN"){
            attr_stack = uin_class_name_attrs_map.at(mo_name);
        }
        
            
        for(int i =0; i < (int)attr_stack.size(); i++){
            string p_name = attr_stack.at(i);
            
            if( p_name == "filename" || 
                p_name == "datetime" || 
                p_name == "bscid" || 
                p_name == "bam_version" ||
                p_name == "omu_ip" || 
                p_name == "mbsc mode" ) continue;

            string mv_parameter = mo_name + "_" + p_name;
            
            string p_value = "";
            if(attr_value_map.count(p_name)){
                
                //Check whether the multi value parameter was detected
                if( parameter_child_map.count(mv_parameter)){
                    string temp_value = attr_value_map.at(p_name);
                    std::vector<string> value_array = bodastage::split_str(temp_value, "&");
                    
                    std::map<string, string> param_value_map;
                    
                    //Iterate over the values in parameterChildMap
                    for(int j = 0; j < (int)value_array.size(); j++){
                        string v = value_array[j];
                        std::vector<string> v_array = bodastage::split_str(v, "-");
                        param_value_map.insert(std::pair<string, string>(v_array[0], bodastage::to_csv_format(v_array[1])));
                    }
                    
                    //Get the child parameters 
                    std::vector<string> child_parameters = parameter_child_map.at(mv_parameter);
                    for(int idx =0; idx < (int)child_parameters.size(); idx++){
                        string child_param = child_parameters.at(idx);
                        
                        if(param_value_map.count(child_param)){
                            string mv_value = param_value_map.at(child_param);
                            p_value_str = p_value_str + "," + bodastage::to_csv_format(mv_value);
                        }else{
                            p_value_str += ",";
                        }
                        
                    }

                    continue;
                }
                
                p_value = attr_value_map.at(p_name);
            }
            
            p_value_str = p_value_str + "," + bodastage::to_csv_format(p_value);
        }
        
        moi_print_writers.at(print_writer_class_name) << p_value_str << endl;
        
        attr_value_map.clear();
        class_name = "";
}


/**
 * Print program's execution time.
 * 
 * @since 1.0.0
 */
void bodastage::BodaHuaweiMMLParser::print_execution_time(){
    float running_time = 0; //System.currentTimeMillis() - startTime;
    
    string s = "Parsing completed. ";
    s = s + "Total time:";
    
    //Get hours
    if( running_time > 1000*60*60 ){
        // int hrs = (int) Math.floor(runningTime/(1000*60*60));
        // s = s + hrs + " hours ";
        // runningTime = runningTime - (hrs*1000*60*60);
    }
    
    //Get minutes
    if(running_time > 1000*60){
        // int mins = (int) Math.floor(runningTime/(1000*60));
        // s = s + mins + " minutes ";
        // runningTime = runningTime - (mins*1000*60);
    }
    
    //Get seconds
    if(running_time > 1000){
        // int secs = (int) Math.floor(runningTime/(1000));
        // s = s + secs + " seconds ";
        // runningTime = runningTime - (secs/1000);
    }
    
    //Get milliseconds
    if(running_time > 0 ){
        // int msecs = (int) Math.floor(runningTime/(1000));
        // s = s + msecs + " milliseconds ";
        // runningTime = runningTime - (msecs/1000);
    }

}
    
/**
 * @brief Close file print writers.
 *
 * @since 1.0.0
 * @version 1.0.0
 */
void bodastage::BodaHuaweiMMLParser::close_mo_pw_map() {

    std::map<string, ofstream>::iterator iter; 
    for (iter = moi_print_writers.begin(); iter != moi_print_writers.end(); iter++){
        iter->second.close();
    }
    moi_print_writers.clear();
}

//     /**
//      * @brief Process given string into a format acceptable for CSV format.
//      *
//      * @since 1.0.0
//      * @param s string
//      * @return string Formated version of input string
//      */
// string bodastage::BodaHuaweiMMLParser::to_csv_format(string s) {
//     string csv_value = s;

//     //Strip start and end quotes
//     s = bodastage::preg_replace(s, "^\"|\"$", "");
    
//     //Check if value contains comma
//     if (bodastage::str_contains(s, ",")) {
//         csv_value = "\"" + s + "\"";
//     }

    
//     if (bodastage::str_contains(s, "\"")) {
//         csv_value = "\"" + bodastage::str_replace(s, "\"", "\"\"") + "\"";
//     }

//     return csv_value;
// }

/**
 * @brief Set the output directory.
 * 
 * @since 1.0.0
 * @version 1.0.0
 * @param directory_name 
 */
void bodastage::BodaHuaweiMMLParser::set_output_directory(string directory_name ){
    output_directory = directory_name;
}
     
/**
 * Set name of file to parser.
 * 
 * @since 1.0.0
 * @version 1.0.0
 * @param directory_name 
 */
void bodastage::BodaHuaweiMMLParser::set_file_name(string filename ){
    data_file = filename;
}


/**
 * Set name of file to parser.
 * 
 * @since 1.0.1
 * @version 1.0.0
 * @param dataSource 
 */
void bodastage::BodaHuaweiMMLParser::set_data_source(string ds ){
    data_source = ds;
}