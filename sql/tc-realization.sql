select sys.name as system, sys.alias as system_cmdb,  sys.version as sys_version,
container.name as container, container.alias as container_code, container.version as container_version,
i.name as interface,i.alias as interface_code, i.version as interface_version,
tc.name as capability, tc.alias as tc_code
    from t_object sys
        left join t_connector s2c on s2c.start_object_id = sys.object_id and connector_type='Realisation'
        left join t_object container on container.object_id=s2c.end_object_id
        left join t_connector c2i on c2i.start_object_id=container.object_id
        left join t_object i on i.object_id=c2i.end_object_id
        left join t_connector i2tc on i2tc.start_object_id=i.object_id
        left join t_object tc on tc.object_id=i2tc.end_object_id
    where sys.alias='CMDB_A' and sys.object_type='Component'