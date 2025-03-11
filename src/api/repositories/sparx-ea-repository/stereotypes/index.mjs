export const ARCHIMATE_CAPABILITY = "ArchiMate_Capability";
export const ARCHIMATE_BUSINESS_ACTOR = "ArchiMate_BusinessActor";
export const ARCHIMATE_TECH_CAPABILITY = "ArchiMate_TechnicalCapability";

export const OBJECT_STEREOTYPES = {
    [ARCHIMATE_CAPABILITY]: {
        properties: {
            object_type: 'Class', stereotype: ARCHIMATE_CAPABILITY,
            scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        },
        t_xref: {
            Stereotypes: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@STEREO;Name=ArchiMate_Capability;FQName=ArchiMate3::ArchiMate_Capability;@ENDSTEREO;'
            },
            CustomProperties: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@PROP=@NAME=_HideUmlLinks@ENDNAME;@TYPE=string@ENDTYPE;@VALU=True@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;@PROP=@NAME=_defaultDiagramType@ENDNAME;@TYPE=string@ENDTYPE;@VALU=ArchiMate3::Motivation@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;'
            }
        }
    },
    [ARCHIMATE_BUSINESS_ACTOR]: {
        properties: {
            object_type: 'Class', stereotype: ARCHIMATE_BUSINESS_ACTOR,
            scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        },
        t_xref: {
            Stereotypes: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@STEREO;Name=ArchiMate_BusinessActor;FQName=ArchiMate3::ArchiMate_BusinessActor;@ENDSTEREO;'
            },
            CustomProperties: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@PROP=@NAME=_HideUmlLinks@ENDNAME;@TYPE=string@ENDTYPE;@VALU=True@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;@PROP=@NAME=_defaultDiagramType@ENDNAME;@TYPE=string@ENDTYPE;@VALU=ArchiMate3::Business@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;'
            }
        }
    },
    [ARCHIMATE_TECH_CAPABILITY]: {
        properties: {
            object_type: 'Class', stereotype: ARCHIMATE_TECH_CAPABILITY,
            scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        },
        t_xref: {
            Stereotypes: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@STEREO;Name=ArchiMate_TechnicalCapability;FQName=ArchiMate3::ArchiMate_TechnicalCapability;@ENDSTEREO;'
            },
            CustomProperties: {
                type: "element property", supplier: '<none>', visibility: "Public", partition: '0',
                description: '@PROP=@NAME=_HideUmlLinks@ENDNAME;@TYPE=string@ENDTYPE;@VALU=True@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;@PROP=@NAME=_defaultDiagramType@ENDNAME;@TYPE=string@ENDTYPE;@VALU=ArchiMate3::Motivation@ENDVALU;@PRMT=@ENDPRMT;@ENDPROP;'
            }
        }
    }
}